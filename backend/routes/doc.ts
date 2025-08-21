// backend/routes/doc.ts
// Routes for document conversion using headless LibreOffice (soffice).
import path from "path";
import crypto from "crypto";

import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { convertWithSoffice, docMime } from "../lib/docs.js";
import type { DocTarget } from "../lib/docs.js";

import {
  UP,
  OUT,
  readFileAndUnlink,
  saveUploadToDisk,
  unlinkSafe,
} from "../lib/storage.js";

export default async function docsRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post("/convert", async (req, reply) => {
    const mp = await req.file(); // field "file"
    if (!mp) return reply.code(400).send({ error: "No file" });

    function isSupported(inputName: string, target: DocTarget) {
      const ext = path.extname(inputName).toLowerCase();
      const writerIn = [".doc", ".docx", ".odt", ".rtf", ".txt", ".html"];
      const writerOut: DocTarget[] = [
        "pdf",
        "docx",
        "odt",
        "rtf",
        "html",
        "txt",
      ];

      // PDF → DOCX/ODT/RTF/TXT is NOT supported
      if (ext === ".pdf") {
        return ["pdf", "html"].includes(target); // optionally png/jpg if tu ajoutes ces cibles
      }

      if (writerIn.includes(ext)) {
        return writerOut.includes(target);
      }

      // add calc & impress here if needed later
      return false;
    }

    const target = ((req.headers["x-target"] as string) || "pdf") as DocTarget;

    if (!isSupported(mp.filename, target)) {
      return reply.code(422).send({
        error: "unsupported-conversion",
        detail:
          "This conversion isn't supported by LibreOffice. Example: PDF → DOCX is not supported. Try PDF → HTML or DOCX → PDF.",
      });
    }

    const id = crypto.randomUUID();
    const inPath = path.join(UP, `${id}-${mp.filename}`);
    const outPath = path.join(OUT, `${id}.${target}`);

    try {
      await saveUploadToDisk(mp.file, inPath);

      const produced = await convertWithSoffice(
        inPath,
        path.dirname(outPath),
        target,
        (line) => app.log.info(line)
      );

      // Clean input
      await unlinkSafe(inPath);

      // Respond with the converted file
      reply.header(
        "Content-Disposition",
        `attachment; filename="output.${target}"`
      );
      reply.type(docMime(target));

      const buf = await readFileAndUnlink(produced);
      return reply.send(buf);
    } catch (e) {
      app.log.error(e);
      await unlinkSafe(inPath);
      await unlinkSafe(outPath);
      return reply.code(500).send({ error: "document convert failed" });
    }
  });
}
