// backend/lib/storage.ts
import { createWriteStream, promises as fs } from "fs";
import path from "path";

/**
 * storage utility functions
 * - UP/OUT: directories for uploads and outputs
 * - helpers to write/read/unlink files safely
 */
export const UP = path.join(process.cwd(), "uploads");
export const OUT = path.join(process.cwd(), "outputs");

export async function ensureDirs() {
  await fs.mkdir(UP, { recursive: true });
  await fs.mkdir(OUT, { recursive: true });
}

/**
 * saveUploadToDisk
 * - Pipe an incoming readable stream to a destination file and resolve when
 *   the write finishes.
 */
export async function saveUploadToDisk(
  stream: NodeJS.ReadableStream,
  dest: string
) {
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(dest);
    stream.pipe(ws);
    ws.on("finish", () => resolve());
    ws.on("error", reject);
  });
}

/**
 * readFileAndUnlink
 * - Read a file into a buffer then best-effort delete the file (non-blocking
 *   unlink).
 */
export async function readFileAndUnlink(filePath: string) {
  const buf = await fs.readFile(filePath);
  fs.unlink(filePath).catch(() => {});
  return buf;
}

export async function unlinkSafe(p: string) {
  try {
    await fs.unlink(p);
  } catch {
    // Ignore errors
  }
}

/**
 * asNumber
 * - Convert unknown to a finite number, or return the provided fallback.
 */
export function asNumber(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * videoMime
 * - Map file extensions to common video MIME types.
 */
export function videoMime(ext: string): string {
  switch (ext) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mkv":
      return "video/x-matroska";
    case "avi":
      return "video/x-msvideo";
    case "mov":
      return "video/quicktime";
    case "flv":
      return "video/x-flv";
    default:
      return "application/octet-stream";
  }
}
