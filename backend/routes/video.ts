/**
 * backend/routes/video.ts
 *
 * Fastify route for video conversion. Accepts a multipart upload (field
 * "file") and conversion options via headers. Writes temporary files,
 * invokes FFmpeg, and returns the converted file as an attachment.
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
  videoMime,
} from "../lib/storage.js";
import { buildVideoArgs, runFFmpeg, type VideoTarget } from "../lib/ffmpeg.js";

export default async function videoRoutes(
  app: FastifyInstance,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _opts: FastifyPluginOptions
) {
  app.post("/convert", async (req, reply) => {
    const mp = await req.file(); // multipart file field "file"
    if (!mp) return reply.code(400).send({ error: "No file" });

    // Parse headers with defaults tailored for video
    const target = ((req.headers["x-target"] as string) ||
      "mp4") as VideoTarget;
    const crf = asNumber(req.headers["x-crf"], target === "webm" ? 28 : 23);
    const preset = (req.headers["x-preset"] as string) || "veryfast";
    const audioKbps = asNumber(req.headers["x-audio-kbps"], 128);
    const maxW = asNumber(req.headers["x-max-w"], 0);
    const maxH = asNumber(req.headers["x-max-h"], 0);
    const fps = asNumber(req.headers["x-fps"], 0);

    // Temporary file paths
    const id = crypto.randomUUID();
    const inPath = path.join(UP, `${id}-${mp.filename}`);
    const outPath = path.join(OUT, `${id}.${target}`);

    await saveUploadToDisk(mp.file, inPath);

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
    const code = await runFFmpeg(args, (line) => app.log.info(line));

    await unlinkSafe(inPath);

    if (code !== 0) {
      await unlinkSafe(outPath);
      return reply.code(500).send({ error: "ffmpeg failed" });
    }

    reply.header(
      "Content-Disposition",
      `attachment; filename="output.${target}"`
    );
    reply.type(videoMime(target));

    const buf = await readFileAndUnlink(outPath);
    return reply.send(buf);
  });
}
