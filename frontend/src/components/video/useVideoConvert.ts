// src/components/video/useVideoConvert.ts
import { useState } from "react";
import { postConvert } from "@/lib/api";

export type VideoFormat = "mp4" | "webm" | "mkv" | "avi" | "mov" | "flv";

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
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);

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
      alert("Conversion vidéo (backend) échouée.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
