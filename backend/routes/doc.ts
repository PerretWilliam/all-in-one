// Route: batch document conversion endpoint using headless LibreOffice (soffice).
// Developer notes: this streams a ZIP back to the client while converting each
// uploaded document sequentially. Errors for individual files are recorded
// inside the archive as .ERROR.txt entries; catastrophic stream errors
// will destroy the connection.

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { DocTarget } from "../lib/docs.js";

// Node built-ins
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

// Third-party
import archiver from "archiver";

// Local helpers
import { convertWithSoffice } from "../lib/docs.js";
import { UP, OUT, saveUploadToDisk, unlinkSafe } from "../lib/storage.js";

export default async function docRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post("/convert-batch", async (req, reply) => {
    const target = ((req.headers["x-target"] as string) || "pdf") as DocTarget;

    // Send response headers first
    const zipId = crypto.randomUUID();
    reply.header(
      "Content-Disposition",
      `attachment; filename="docs-batch-${zipId}.zip"`
    );
    reply.type("application/zip");

    // Create the ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Fatal error during streaming -> destroy the connection
    archive.on("error", (err: Error) => {
      reply.log.error(err);
      reply.raw.destroy(err);
    });

    // Send the archive stream via Fastify (ensures headers and CORS are handled)
    reply.send(archive);

    try {
      const parts = req.parts();
      for await (const part of parts) {
        if (!(part.type === "file" && part.file && part.filename)) continue;

        const inId = crypto.randomUUID();
        const inPath = path.join(UP, `${inId}-${part.filename}`);
        await saveUploadToDisk(part.file, inPath);

        const baseName =
          path.parse(part.filename).name.replace(/[^\w.-]+/g, "_") || "file";

        // LibreOffice writes files into a directory; provide OUT as the output dir
        const outDir = OUT;

        try {
          const produced = await convertWithSoffice(
            inPath,
            outDir,
            target,
            (l) => app.log.info(l)
          );
          await unlinkSafe(inPath);

          const buf = await fs.readFile(produced);
          archive.append(buf, { name: `${baseName}.${target}` });
          await unlinkSafe(produced);
        } catch (err: any) {
          await unlinkSafe(inPath);
          archive.append(
            `Failed to convert ${part.filename}\n${String(
              err?.message || err
            )}\n`,
            { name: `${baseName}.ERROR.txt` }
          );
        }
      }

      // Finalize the ZIP (this closes the response stream)
      await archive.finalize();
      // Do not send any further data after finalize
    } catch (e) {
      reply.log.error(e);
      try {
        await archive.abort();
      } catch {}
      // If no bytes were sent yet (rare) we could return a 500 here:
      // if (!reply.raw.headersSent) return reply.code(500).send({ error: "doc batch convert failed" });
    }
  });
}
