/**
 * backend/routes/audio.ts
 *
 * Fastify routes for audio conversion.
 * - Accepts an uploaded file (multipart field "file") and conversion headers
 *   (x-target, x-bitrate).
 * - Writes the uploaded file to disk, invokes FFmpeg, and returns the
 *   converted blob as an attachment. Temporary files are cleaned up.
 */

import path from "path";
import crypto from "crypto";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import {
  UP,
  OUT,
  saveUploadToDisk,
  readFileAndUnlink,
  unlinkSafe,
  asNumber,
} from "../lib/storage.js";
import { buildAudioArgs, runFFmpeg } from "../lib/ffmpeg.js";

export default async function audioRoutes(
  app: FastifyInstance,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _opts: FastifyPluginOptions
) {
  // POST /convert
  // - Expects a multipart upload with field name `file`.
  // - Uses headers to control conversion options (x-target, x-bitrate).
  app.post("/convert", async (req, reply) => {
    const mp = await req.file(); // multipart file field "file"
    if (!mp) return reply.code(400).send({ error: "No file" });

    // Read conversion options from headers with sensible defaults
    const target = (req.headers["x-target"] as string) || "mp3";
    const bitrate = asNumber(req.headers["x-bitrate"], 192);

    // Create unique temporary paths for input and output
    const id = crypto.randomUUID();
    const inPath = path.join(UP, `${id}-${mp.filename}`);
    const outPath = path.join(OUT, `${id}.${target}`);

    // Persist the uploaded stream to disk
    await saveUploadToDisk(mp.file, inPath);

    // Build ffmpeg args and run the conversion
    const args = buildAudioArgs(inPath, outPath, target, bitrate);
    const code = await runFFmpeg(args, (line) => app.log.info(line));

    // Remove the uploaded input file regardless of success
    await unlinkSafe(inPath);

    if (code !== 0) {
      // Conversion failed: remove any produced output and return an error
      await unlinkSafe(outPath);
      return reply.code(500).send({ error: "ffmpeg failed" });
    }

    // Successful conversion: set headers for attachment download
    reply.header(
      "Content-Disposition",
      `attachment; filename="output.${target}"`
    );
    reply.type(`audio/${target === "mp3" ? "mpeg" : target}`);

    const buf = await readFileAndUnlink(outPath);
    return reply.send(buf);
  });
}
