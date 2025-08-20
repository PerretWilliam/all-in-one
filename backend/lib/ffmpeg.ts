// backend/lib/ffmpeg.ts
import ffmpegStatic from "ffmpeg-static";
import { spawn } from "child_process";

/**
 * runFFmpeg
 * - Runs the native FFmpeg binary (provided by ffmpeg-static when possible).
 * - Streams stderr lines to the optional `log` callback and resolves with the
 *   process exit code (or 1 when code is null/undefined).
 */
export function runFFmpeg(
  args: string[],
  log?: (line: string) => void
): Promise<number> {
  const bin = (ffmpegStatic as string) || "ffmpeg";
  return new Promise((resolve) => {
    const p = spawn(bin, args);
    p.stderr.on("data", (d) => log?.(String(d)));
    p.on("close", (code) => resolve(code ?? 1));
  });
}

/** -------- AUDIO -------- */
/**
 * buildAudioArgs
 * - Construct ffmpeg arguments for audio-only conversions.
 */
export function buildAudioArgs(
  inPath: string,
  outPath: string,
  target: string,
  bitrateKbps: number
) {
  const common = ["-y", "-i", inPath];
  if (target === "wav") return [...common, "-c:a", "pcm_s16le", outPath];
  if (target === "ogg")
    return [...common, "-c:a", "libvorbis", "-b:a", `${bitrateKbps}k`, outPath];
  if (target === "opus")
    return [...common, "-c:a", "libopus", "-b:a", `${bitrateKbps}k`, outPath];
  if (target === "aac")
    return [...common, "-c:a", "aac", "-b:a", `${bitrateKbps}k`, outPath];
  // default mp3
  return [...common, "-b:a", `${bitrateKbps}k`, outPath];
}

/** -------- VIDEO -------- */
export type VideoTarget = "mp4" | "webm" | "mkv" | "avi" | "mov" | "flv";

/**
 * buildVideoArgs
 * - Build ffmpeg command-line arguments for video conversions based on the
 *   provided options (format, quality, preset, audio bitrate, optional
 *   scaling and frame-rate overrides).
 */
export function buildVideoArgs(opts: {
  inPath: string;
  outPath: string;
  target: VideoTarget;
  crf: number;
  preset: string;
  audioKbps: number;
  maxW?: number;
  maxH?: number;
  fps?: number;
}) {
  const {
    inPath,
    outPath,
    target,
    crf,
    preset,
    audioKbps,
    maxW = 0,
    maxH = 0,
    fps = 0,
  } = opts;

  const args: string[] = ["-y", "-i", inPath];

  // Optional scale while preserving aspect-ratio
  if (maxW > 0 || maxH > 0) {
    const w = maxW > 0 ? maxW : -1;
    const h = maxH > 0 ? maxH : -1;
    args.push("-vf", `scale=${w}:${h}:force_original_aspect_ratio=decrease`);
  }
  if (fps > 0) args.push("-r", String(fps));

  switch (target) {
    case "webm":
      // VP9 (CRF mode) + Opus
      args.push(
        "-c:v",
        "libvpx-vp9",
        "-b:v",
        "0",
        "-crf",
        String(crf),
        "-c:a",
        "libopus",
        "-b:a",
        `${audioKbps}k`,
        outPath
      );
      break;

    case "mp4":
    case "mov":
      // H.264 + AAC (+faststart for streaming)
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        preset,
        "-crf",
        String(crf),
        "-c:a",
        "aac",
        "-b:a",
        `${audioKbps}k`,
        "-movflags",
        "+faststart",
        outPath
      );
      break;

    case "mkv":
      // Matroska container (x264 + AAC)
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        preset,
        "-crf",
        String(crf),
        "-c:a",
        "aac",
        "-b:a",
        `${audioKbps}k`,
        outPath
      );
      break;

    case "avi": {
      // Old-school: MPEG-4 Part 2 + MP3 (no CRF support; use qscale 2..31)
      const q = Math.max(2, Math.min(31, Math.round((crf - 18) * 2 + 2)));
      args.push(
        "-c:v",
        "mpeg4",
        "-q:v",
        String(q),
        "-c:a",
        "libmp3lame",
        "-b:a",
        `${audioKbps}k`,
        outPath
      );
      break;
    }

    case "flv":
      // H.264 + AAC in FLV
      args.push(
        "-c:v",
        "libx264",
        "-crf",
        String(crf),
        "-preset",
        preset,
        "-c:a",
        "aac",
        "-b:a",
        `${audioKbps}k`,
        outPath
      );
      break;
  }

  return args;
}
