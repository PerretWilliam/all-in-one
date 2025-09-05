// src/components/youtube/useYtToVideo.ts
import { useState } from "react";
import { postJsonBlob } from "@/lib/api";

export type YtVideoTarget = "mp4" | "webm" | "mkv" | "avi" | "mov" | "flv";

export function useYtToVideo() {
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  async function convert(opts: {
    url: string;
    target: YtVideoTarget;
    crf: number;
    preset: string;
    audioKbps: number;
    maxW?: number | "";
    maxH?: number | "";
    fps?: number | "";
  }) {
    setBusy(true);
    setOutUrl(null);
    try {
      const body: Record<string, unknown> = {
        url: opts.url,
        target: opts.target,
        crf: opts.crf,
        preset: opts.preset,
        audioKbps: opts.audioKbps,
      };
      if (typeof opts.maxW === "number" && opts.maxW > 0) body.maxW = opts.maxW;
      if (typeof opts.maxH === "number" && opts.maxH > 0) body.maxH = opts.maxH;
      if (typeof opts.fps === "number" && opts.fps > 0) body.fps = opts.fps;

      const blob = await postJsonBlob("/youtube/video", body);
      setOutUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
