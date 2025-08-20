/**
 * hooks/useVideoConvert.ts
 *
 * Hook that posts video files to the backend conversion endpoint and exposes
 * a blob URL for the converted result.
 *
 * - `convert` accepts a File and parameters for encoding (format, crf, preset,
 *   audio bitrate, optional resize and fps) and sets `outUrl` to a local blob
 *   URL when the server returns the converted file.
 */

import { useState } from "react";
import { postConvert } from "@/lib/api";
import type { VideoFormat } from "@/lib/types";

export type VideoParams = {
  format: VideoFormat;
  crf: number;
  preset: string;
  audioKbps: number;
  maxW?: number | "";
  maxH?: number | "";
  fps?: number | "";
};

export function useVideoConvert() {
  // Indicates an in-progress conversion
  const [busy, setBusy] = useState(false);
  // Local blob URL for the converted video
  const [outUrl, setOutUrl] = useState<string | null>(null);

  /**
   * convert
   * - Sends the file to the backend with headers describing encoding options.
   * - The backend returns the converted file as a blob; we create an object URL
   *   so the UI can provide a download link without uploading the file again.
   */
  async function convert(file: File, p: VideoParams) {
    setBusy(true);
    setOutUrl(null);
    try {
      const headers: Record<string, string> = {
        "x-target": p.format,
        "x-crf": String(p.crf),
        "x-preset": p.preset,
        "x-audio-kbps": String(p.audioKbps),
      };
      if (typeof p.maxW === "number" && p.maxW > 0)
        headers["x-max-w"] = String(p.maxW);
      if (typeof p.maxH === "number" && p.maxH > 0)
        headers["x-max-h"] = String(p.maxH);
      if (typeof p.fps === "number" && p.fps > 0)
        headers["x-fps"] = String(p.fps);

      const blob = await postConvert("/video/convert", file, headers);
      setOutUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      // User-facing message in English
      alert("Video conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
