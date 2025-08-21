/**
 * Route: batch audio conversion endpoint using FFmpeg.
 *
 * Developer notes:
 * - Streams a ZIP back to the client while converting uploaded audio files sequentially.
 * - Individual file failures are written into the archive as `.ERROR.txt` files.
 * - Catastrophic stream errors will destroy the connection.
 *
 * Accepted request headers:
 * - x-target: target audio format (e.g. 'mp3', 'aac')
 * - x-bitrate: audio bitrate (kbps)
 */

// Node built-ins
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

// Third-party
import archiver from "archiver";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

// Local helpers
import { buildAudioArgs, runFFmpeg } from "../lib/ffmpeg.js";
import { OUT, UP, saveUploadToDisk, unlinkSafe } from "../lib/storage.js";

export default async function audioRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post("/convert-batch", async (req, reply) => {
    const target = (req.headers["x-target"] as string) || "mp3";
    const bitrate = Number(req.headers["x-bitrate"] || 192);

    const zipId = crypto.randomUUID();
    reply
      .type("application/zip")
      .header(
        "Content-Disposition",
        `attachment; filename="audio-batch-${zipId}.zip"`
      );

    const archive = archiver("zip", { zlib: { level: 9 } });

    // If the archiver stream errors at any point, log and destroy the raw
    // socket. Once the HTTP body/stream has started we cannot send a 500.
    archive.on("error", (err: Error) => {
      reply.log.error(err);
      // Close the connection (can't send a 500 once streaming has begun).
      reply.raw.destroy(err);
    });

    //! IMPORTANT: hand off the archive stream to Fastify so Fastify manages
    //! the underlying response stream and headers. Do not pipe manually.
    reply.send(archive);

    try {
      const parts = req.parts();
      for await (const part of parts) {
        // Fastify's multipart parts is an async iterator. We handle files
        // sequentially to limit concurrent ffmpeg jobs and memory usage.
        // Skip non-file parts.
        if (part.type !== "file" || typeof part.file !== "object") continue;

        const inId = crypto.randomUUID();
        const inPath = path.join(UP, `${inId}-${part.filename}`);
        await saveUploadToDisk(part.file, inPath);

        // Create a safe filename for the archive entry and determine output
        // path. Output files are written to the configured OUT directory.
        const baseName =
          path.parse(part.filename).name.replace(/[^\w.-]+/g, "_") || "file";
        const outPath = path.join(OUT, `${inId}.${target}`);

        // Build ffmpeg args and execute. runFFmpeg resolves with the exit
        // code from the ffmpeg process. We log ffmpeg output for debugging.
        const args = buildAudioArgs(inPath, outPath, target as any, bitrate);
        const code = await runFFmpeg(args, (l) => app.log.info(l));

        // Always attempt to remove the temporary input file.
        await unlinkSafe(inPath);

        if (code !== 0) {
          // Conversion failed: remove any partial output and write a small
          // .ERROR.txt entry into the zip so the client knows which files
          // failed and why.
          await unlinkSafe(outPath);
          archive.append(`Failed to convert ${part.filename}\n`, {
            name: `${baseName}.ERROR.txt`,
          });
          continue;
        }

        // Read the converted file into memory and append it to the zip.
        // This keeps the archive streaming and avoids exposing filesystem
        // paths to clients.
        const buf = await fs.readFile(outPath);
        archive.append(buf, { name: `${baseName}.${target}` });
        await unlinkSafe(outPath);
      }

      // Termine le ZIP (déclenche la fin du stream côté client)
      // Finalize the archive which signals end-of-stream to the client.
      await archive.finalize();
      // Do not send any other payload here: the response is the streaming zip.
    } catch (e) {
      reply.log.error(e);
      try {
        archive.abort();
      } catch {}
      // If nothing has been written yet (very early), you could send a 500:
      // if (!reply.raw.headersSent) return reply.code(500).send({ error: '...' });
      // In practice, bytes have usually already been sent by the time an
      // exception bubbles here, so we abort the archive/connection instead.
    }
  });
}
