// Route: batch image conversion endpoint using sharp.
// Developer notes: this endpoint streams a ZIP while converting images sequentially.
// Individual conversion failures are written into the archive as .ERROR.txt files.

import type { FastifyInstance, FastifyPluginOptions } from "fastify";

// Node built-ins
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

// Third-party
import archiver from "archiver";
import sharp from "sharp";

// Local helpers
import { UP, OUT, saveUploadToDisk, unlinkSafe } from "../lib/storage.js";

type ImgTarget = "webp" | "avif" | "jpeg" | "png";

async function convertImage(
  inPath: string,
  outPath: string,
  target: ImgTarget,
  quality: number,
  maxW: number,
  maxH: number,
  keepAspect: boolean
) {
  // Create a sharp instance. failOn: 'none' tolerates some corrupt images.
  let img = sharp(inPath, { failOn: "none" });

  if (maxW > 0 || maxH > 0) {
    img = img.resize({
      width: maxW || undefined,
      height: maxH || undefined,
      fit: keepAspect ? "inside" : "fill",
      withoutEnlargement: true,
    });
  }

  switch (target) {
    case "jpeg":
      img = img.jpeg({ quality, mozjpeg: true });
      break;
    case "png":
      img = img.png({ compressionLevel: 6 });
      break;
    case "webp":
      img = img.webp({ quality });
      break;
    case "avif":
      img = img.avif({ quality });
      break;
  }

  await img.toFile(outPath);
}

export default async function imageRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post("/convert-batch", async (req, reply) => {
    // Read headers from the client with safe fallbacks
    const target = (req.headers["x-target"] as ImgTarget) || "webp";
    const quality = Math.max(
      1,
      Math.min(100, Number(req.headers["x-quality"] || 80))
    );
    const maxW = Number(req.headers["x-max-w"] || 0);
    const maxH = Number(req.headers["x-max-h"] || 0);
    const keepAspect =
      String(req.headers["x-keep-aspect"] || "true").toLowerCase() !== "false";

    // Set ZIP response headers before streaming the archive
    const zipId = crypto.randomUUID();
    reply.header(
      "Content-Disposition",
      `attachment; filename="images-batch-${zipId}.zip"`
    );
    reply.type("application/zip");

    // Create the archive stream
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Fatal ZIP error -> destroy the connection (likely bytes were sent)
    archive.on("error", (err: Error) => {
      reply.log.error(err);
      reply.raw.destroy(err);
    });

    // Give the archive stream to Fastify so it handles headers/CORS properly
    reply.send(archive);

    try {
      const parts = req.parts();
      for await (const part of parts) {
        if (!(part.type === "file" && part.file && part.filename)) continue;

        const inId = crypto.randomUUID();
        const inPath = path.join(UP, `${inId}-${part.filename}`);
        await saveUploadToDisk(part.file, inPath);

        const baseName =
          path.parse(part.filename).name.replace(/[^\w.-]+/g, "_") || "image";
        const outPath = path.join(OUT, `${inId}.${target}`);

        try {
          await convertImage(
            inPath,
            outPath,
            target,
            quality,
            maxW,
            maxH,
            keepAspect
          );
          await unlinkSafe(inPath);

          const buf = await fs.readFile(outPath);
          archive.append(buf, { name: `${baseName}.${target}` });
          await unlinkSafe(outPath);
        } catch (err: any) {
          await unlinkSafe(inPath);
          await unlinkSafe(outPath);
          archive.append(
            `Failed to convert ${part.filename}\n${String(
              err?.message || err
            )}\n`,
            { name: `${baseName}.ERROR.txt` }
          );
        }
      }

      // Finalize the archive (ends the response stream)
      await archive.finalize();
      //! Don't write anything else after finalizing the archive
    } catch (e) {
      reply.log.error(e);
      try {
        archive.abort();
      } catch {}
      // If no bytes were sent yet, you could return a 500 here:
      // if (!reply.raw.headersSent) return reply.code(500).send({ error: "image batch convert failed" });
    }
  });
}
