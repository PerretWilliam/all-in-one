/**
 * backend/routes/ytdlVideo.ts
 *
 * Routes to download and convert YouTube videos. The route will:
 * 1) Download a video/container using yt-dlp
 * 2) Select a suitable downloaded file (prefer a video container)
 * 3) Probe codecs and optionally merge / fix audio
 * 4) Copy/remux or transcode to the requested target and return it
 */

import path from "path";
import crypto from "crypto";
import { promises as fs } from "fs";
import ytdl from "youtube-dl-exec";
import { spawn, spawnSync } from "child_process";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import {
  UP,
  OUT,
  readFileAndUnlink,
  unlinkSafe,
  asNumber,
  videoMime,
} from "../lib/storage.js";
import { buildVideoArgs, runFFmpeg, type VideoTarget } from "../lib/ffmpeg.js";

// Prefer a real video container over audio-only
const VIDEO_EXTS = [".mp4", ".webm", ".mkv", ".mov", ".avi", ".flv"];
const AUDIO_EXTS = [".m4a", ".mp3", ".ogg", ".opus", ".wav"];

// Pick the best output file produced by yt-dlp for this id
async function pickDownloadedFile(id: string) {
  const files = await fs.readdir(UP);
  const matches = await Promise.all(
    files
      .filter((f) => f.startsWith(id + "."))
      .map(async (name) => {
        const full = path.join(UP, name);
        const stat = await fs.stat(full).catch(() => null);
        return stat
          ? {
              name,
              full,
              ext: path.extname(name).toLowerCase(),
              size: stat.size,
            }
          : null;
      })
  );
  const list = (
    matches.filter(Boolean) as Array<{
      name: string;
      full: string;
      ext: string;
      size: number;
    }>
  ).sort((a, b) => b.size - a.size); // largest first

  // 1) prefer any real video container
  const container = list.find((e) => VIDEO_EXTS.includes(e.ext));
  if (container) return { kind: "video", ...container };

  // 2) if no container, see if only audio is there
  const audioOnly = list.find((e) => AUDIO_EXTS.includes(e.ext));
  if (audioOnly) return { kind: "audio", ...audioOnly };

  // nothing found
  return null;
}

// Probe codecs (video + audio) using ffprobe when available
async function probeCodecs(filePath: string) {
  if (ffprobeAvailable()) {
    return await new Promise<{ v: string | null; a: string | null }>(
      (resolve) => {
        const p = spawn("ffprobe", [
          "-v",
          "error",
          "-show_entries",
          "stream=codec_type,codec_name",
          "-of",
          "json",
          filePath,
        ]);
        let buf = "";
        p.stdout.on("data", (d: Buffer) => (buf += d.toString()));
        p.on("close", () => {
          try {
            const j = JSON.parse(buf || "{}");
            let v: string | null = null;
            let a: string | null = null;
            if (Array.isArray(j.streams)) {
              for (const s of j.streams) {
                if (!v && s.codec_type === "video") v = s.codec_name || null;
                if (!a && s.codec_type === "audio") a = s.codec_name || null;
              }

              // Log the number of streams and detected codecs
              console.log(
                `Found ${j.streams.length} streams in file: ${filePath}`
              );
              console.log(
                `Video codec: ${v || "NONE"}, Audio codec: ${a || "NONE"}`
              );
            }
            resolve({ v, a });
          } catch (err) {
            console.error(`Error parsing ffprobe output: ${err}`);
            resolve({ v: null, a: null });
          }
        });
        p.on("error", (err) => {
          console.error(`ffprobe error: ${err}`);
          resolve({ v: null, a: null });
        });
      }
    );
  }
  console.warn("ffprobe not available, cannot detect codecs");
  return { v: null, a: null };
}

// Choose a simple yt-dlp format string depending on requested container
function formatSelectorFor(target: VideoTarget) {
  // Prefer bestvideo+bestaudio (DASH) to allow high resolutions. Fallback
  // progressively if a video+audio pair isn't available.
  if (target === "mp4" || target === "mov") {
    // 1) Prefer MP4 pair when possible (H.264 + m4a)
    // 2) Generic pair
    // 3) Progressive MP4
    // 4) Generic best
    // Ensure audio is present with the chosen video stream
    return "bestvideo[ext=mp4][vcodec*=avc1]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4][acodec!=none]/best[acodec!=none]";
  }
  if (target === "webm") {
    return "bestvideo[ext=webm]+bestaudio[ext=webm]/bestvideo+bestaudio/best[ext=webm][acodec!=none]/best[acodec!=none]";
  }
  // For MKV/AVI/FLV take the best video+audio and remux/transcode later.
  // Ensure audio is present.
  return "bestvideo+bestaudio/best[acodec!=none]";
}

function ffprobeAvailable() {
  try {
    const p = spawnSync("ffprobe", ["-version"]);
    return p && p.status === 0;
  } catch {
    return false;
  }
}

type Body = {
  url?: string;
  target?: VideoTarget;
  crf?: number;
  preset?: string;
  audioKbps?: number;
  maxW?: number;
  maxH?: number;
  fps?: number;
};

export default async function ytdlVideoRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post("/video", async (req, reply) => {
    const b = (req.body || {}) as Body;
    const url = (b.url || "").trim();
    const target = (b.target || "mp4") as VideoTarget;
    const crf = asNumber(b.crf, target === "webm" ? 28 : 23);
    const preset = b.preset || "veryfast";
    const audioKbps = asNumber(b.audioKbps, 128);
    const maxW = asNumber(b.maxW, 0);
    const maxH = asNumber(b.maxH, 0);
    const fps = asNumber(b.fps, 0);

    if (!url) return reply.code(400).send({ error: "Missing url" });

    const id = crypto.randomUUID();
    const dlTemplate = path.join(UP, `${id}.%(ext)s`);
    const outPath = path.join(OUT, `${id}.${target}`);

    try {
      // 1) Download video with a simple, safe selector
      const selector = formatSelectorFor(target);
      const mergeOut =
        target === "mp4" || target === "mov"
          ? "mp4"
          : target === "webm"
          ? "webm"
          : "mkv"; // generic merge container

      await ytdl(url, {
        output: dlTemplate,
        format: formatSelectorFor(target),
        mergeOutputFormat: mergeOut as "mp4" | "webm" | "mkv",
        noCheckCertificates: true,
        noWarnings: true,
        quiet: true,
        noPlaylist: true,
        socketTimeout: 15,
        restrictFilenames: true,
        retries: 3,
      });

      // 2) Pick the merged/container file (avoid grabbing audio-only)
      const picked = await pickDownloadedFile(id);
      if (!picked) {
        return reply.code(500).send({ error: "Download failed" });
      }
      if (picked.kind === "audio") {
        // We downloaded only audio (blocked video / region / age / DRM)
        await unlinkSafe(picked.full);
        return reply
          .code(422)
          .send({ error: "Downloaded file has no video stream." });
      }

      const inPath0 = picked.full;

      // --- 1) Initial codec probe ---
      let inPath = inPath0; // may be replaced after merge/fixes
      let { v: vcodec, a: acodec } = await probeCodecs(inPath);
      app.log.info({ inPath, vcodec, acodec }, "Probed codecs");

      // --- 2) If missing audio: download bestaudio and merge ---
      if (!acodec) {
        const audioTmp = path.join(UP, `${id}.audio.m4a`);
        // download an audio track we can use (prefer m4a)
        await ytdl(url, {
          output: audioTmp,
          format: "bestaudio[ext=m4a]/bestaudio",
          noCheckCertificates: true,
          noWarnings: true,
          quiet: true,
          noPlaylist: true,
          socketTimeout: 15,
          restrictFilenames: true,
          retries: 3,
        });

        // merge video + audio (without reencoding the video)
        const mergedWithAudio = path.join(UP, `${id}.merged.mp4`);
        const mergeArgs = [
          "-y",
          "-i",
          inPath,
          "-i",
          audioTmp,
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-shortest",
          mergedWithAudio,
        ];
        const mcode = await runFFmpeg(mergeArgs, (l) => app.log.info(l));
        await unlinkSafe(audioTmp);
        if (mcode !== 0) {
          return reply.code(500).send({
            error: "ffmpeg failed while merging audio",
          });
        }
        await unlinkSafe(inPath);
        inPath = mergedWithAudio;

        // re-probe to update codec information
        ({ v: vcodec, a: acodec } = await probeCodecs(inPath));
        app.log.info({ inPath, vcodec, acodec }, "After audio merge");
      }

      // --- 3) MP4 compatibility: if audio is not AAC, re-encode audio only ---
      const extNow = path.extname(inPath).toLowerCase();
      const wantMp4 = target === "mp4" || target === "mov";
      const isH264 =
        (vcodec || "").includes("h264") || (vcodec || "").includes("avc1");
      const isAAC =
        (acodec || "").includes("aac") || (acodec || "").includes("mp4a");

      if (wantMp4 && (!isAAC || extNow !== ".mp4")) {
        // Keep the video stream as-is, convert audio to AAC and put in MP4
        const fixedMp4 = path.join(UP, `${id}.fixaudio.mp4`);
        const fixArgs = [
          "-y",
          "-i",
          inPath,
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-movflags",
          "+faststart",
          fixedMp4,
        ];
        const fcode = await runFFmpeg(fixArgs, (l) => app.log.info(l));
        if (fcode !== 0) {
          await unlinkSafe(fixedMp4);
          return reply
            .code(500)
            .send({ error: "ffmpeg failed while fixing audio" });
        }
        await unlinkSafe(inPath);
        inPath = fixedMp4;

        ({ v: vcodec, a: acodec } = await probeCodecs(inPath));
        app.log.info({ inPath, vcodec, acodec }, "After audio fix to AAC");
      }

      // --- 4) Decide: copy, remux or full transcode ---
      const wantWebm = target === "webm";
      const wantMkv = target === "mkv";

      const ext = path.extname(inPath).toLowerCase();
      const canCopy =
        (wantMp4 && ext === ".mp4" && isH264 && isAAC) ||
        (wantWebm && ext === ".webm") ||
        (wantMkv && ext === ".mkv");

      if (canCopy) {
        await fs.copyFile(inPath, outPath);
        await unlinkSafe(inPath);
      } else {
        // (Re)encode to the requested format
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
      }

      // 4) Return binary
      reply.header(
        "Content-Disposition",
        `attachment; filename="youtube.${target}"`
      );
      reply.type(videoMime(target));
      const buf = await readFileAndUnlink(outPath);
      return reply.send(buf);
    } catch (e) {
      app.log.error(e);
      return reply.code(500).send({ error: "youtube download/convert failed" });
    }
  });
}
