/**
 * Route: batch video conversion endpoint using FFmpeg.
 *
 * Developer notes:
 * - Streams a ZIP back to the client while converting uploaded videos sequentially.
 * - Individual file failures are recorded inside the archive as `.ERROR.txt` entries.
 * - Catastrophic stream errors will destroy the connection.
 *
 * Accepted request headers (client -> server):
 * - x-target: video target format (e.g. 'mp4', 'webm')
 * - x-crf: CRF value (numeric)
 * - x-preset: ffmpeg preset (string)
 * - x-audio-kbps: audio bitrate (kbps)
 * - x-max-w / x-max-h: optional maximum dimensions
 * - x-fps: optional target frames per second
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { VideoTarget } from "../lib/ffmpeg.js";

// Node built-ins
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

// Third-party
import archiver from "archiver";

// Local helpers
import { buildVideoArgs, runFFmpeg } from "../lib/ffmpeg.js";
import { UP, OUT, saveUploadToDisk, unlinkSafe } from "../lib/storage.js";

export default async function videoRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post("/convert-batch", async (req, reply) => {
    // Read headers (provided by the frontend)
    const target = (req.headers["x-target"] as VideoTarget) || "mp4";
    const crf = Number(req.headers["x-crf"] || (target === "webm" ? 28 : 23));
    const preset = (req.headers["x-preset"] as string) || "veryfast";
    const audioKbps = Number(req.headers["x-audio-kbps"] || 128);
    const maxW = Number(req.headers["x-max-w"] || 0);
    const maxH = Number(req.headers["x-max-h"] || 0);
    const fps = Number(req.headers["x-fps"] || 0);

    // Prepare the ZIP response (set headers before sending the stream)
    const zipId = crypto.randomUUID();
    reply.header(
      "Content-Disposition",
      `attachment; filename="video-batch-${zipId}.zip"`
    );
    reply.type("application/zip");

    // Create the ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    // ZIP stream error handling: destroy the connection on fatal errors
    archive.on("error", (err: Error) => {
      reply.log.error(err);
      // At this point bytes were likely already sent — destroy the socket
      reply.raw.destroy(err);
    });

    // Hand the stream to Fastify so it can attach CORS/headers correctly
    reply.send(archive);

    try {
      // Iterate over multipart parts (multiple files)
      const parts = req.parts();
      for await (const part of parts) {
        if (!(part.type === "file" && part.file && part.filename)) continue;

        const inId = crypto.randomUUID();
        const inPath = path.join(UP, `${inId}-${part.filename}`);
        await saveUploadToDisk(part.file, inPath);

        const baseName =
          path.parse(part.filename).name.replace(/[^\w.-]+/g, "_") || "file";
        const outPath = path.join(OUT, `${inId}.${target}`);

        // Build ffmpeg arguments for the video conversion
        const args = buildVideoArgs({
          inPath,
          outPath,
          target,
          crf,
          preset,
          audioKbps,
          maxW,
          maxH,
          fps,
        });

        const code = await runFFmpeg(args, (l) => app.log.info(l));
        await unlinkSafe(inPath);

        if (code !== 0) {
          await unlinkSafe(outPath);
          // Add a small error file in the ZIP for this input
          archive.append(`Failed to convert ${part.filename}\n`, {
            name: `${baseName}.ERROR.txt`,
          });
          continue;
        }

        // Append the converted file to the ZIP and clean up the disk
        const buf = await fs.readFile(outPath);
        archive.append(buf, { name: `${baseName}.${target}` });
        await unlinkSafe(outPath);
      }

      // Finalize the ZIP (signals end of stream to client)
      await archive.finalize();
      // Don't send anything else here: the response is the stream.
    } catch (e) {
      reply.log.error(e);
      try {
        archive.abort();
      } catch {}
      // If no bytes were sent yet (rare), you could return a 500:
      // if (!reply.raw.headersSent) return reply.code(500).send({ error: "video batch convert failed" });
      // Otherwise let the stream close via destroy/abort.
    }
  });
}
