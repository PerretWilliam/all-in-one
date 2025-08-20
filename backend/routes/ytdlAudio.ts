// backend/routes/ytdlAudio.ts
/**
 * Routes to download audio from YouTube and convert it to a requested format.
 *
 * Workflow:
 * 1. Use youtube-dl/yt-dlp to download the best audio track to a temp file.
 * 2. Locate the downloaded file in the uploads directory.
 * 3. Run FFmpeg to transcode to the requested audio format.
 * 4. Return the converted file as an attachment and cleanup temporary files.
 */

import path from "path";
import crypto from "crypto";
import { promises as fs } from "fs";
import ytdl from "youtube-dl-exec";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import {
  UP,
  OUT,
  readFileAndUnlink,
  unlinkSafe,
  asNumber,
} from "../lib/storage.js";
import { buildAudioArgs, runFFmpeg } from "../lib/ffmpeg.js";

// Helper: finds the file downloaded by yt-dlp (searches uploads for prefix)
async function findDownloadedFile(prefixId: string) {
  const files = await fs.readdir(UP);
  const match = files.find((f) => f.startsWith(prefixId + "."));
  return match ? path.join(UP, match) : null;
}

type Body = {
  url?: string;
  target?: "mp3" | "aac" | "ogg" | "opus" | "wav";
  bitrate?: number;
};

export default async function youtubeRoutes(
  app: FastifyInstance,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _opts: FastifyPluginOptions
) {
  app.post("/audio", async (req, reply) => {
    const body = (req.body || {}) as Body;
    const url = (body.url || "").trim();
    const target = (body.target || "mp3") as Body["target"];
    const bitrate = asNumber(body.bitrate, 192);

    if (!url) return reply.code(400).send({ error: "Missing url" });

    const id = crypto.randomUUID();
    const dlTemplate = path.join(UP, `${id}.%(ext)s`);
    const outPath = path.join(OUT, `${id}.${target}`);

    try {
      // 1) Download the audio with yt-dlp (best available audio track)
      await ytdl(url, {
        output: dlTemplate,
        format: "bestaudio/best",
        // Useful options to avoid some blocks
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        // Reduce logs
        quiet: true,
        // Reasonable timeout (seconds)
        socketTimeout: 15,
      });

      // 2) Find the downloaded file
      const inPath = await findDownloadedFile(id);
      if (!inPath) {
        return reply.code(500).send({ error: "Download failed" });
      }

      // 3) Convert to requested target via ffmpeg
      const args = buildAudioArgs(inPath, outPath, target!, bitrate);
      const code = await runFFmpeg(args, (line) => app.log.info(line));

      // Clean up the input file
      await unlinkSafe(inPath);

      if (code !== 0) {
        await unlinkSafe(outPath);
        return reply.code(500).send({ error: "ffmpeg failed" });
      }

      // 4) Return the converted file as an attachment
      reply.header(
        "Content-Disposition",
        `attachment; filename="youtube.${target}"`
      );
      reply.type(`audio/${target === "mp3" ? "mpeg" : target}`);
      const buf = await readFileAndUnlink(outPath);
      return reply.send(buf);
    } catch (e) {
      app.log.error(e);
      return reply.code(500).send({ error: "youtube download/convert failed" });
    }
  });
}
