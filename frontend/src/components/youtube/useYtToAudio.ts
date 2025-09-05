// src/components/youtube/useYtToAudio.ts
import { useState } from "react";
import { postJson } from "@/lib/api";

export type YtAudioFormat = "mp3" | "aac" | "ogg" | "opus" | "wav";

export function useYtToAudio() {
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  async function convert(url: string, format: YtAudioFormat, bitrate: number) {
    setBusy(true);
    setOutUrl(null);
    try {
      const res = await postJson<Response>("/youtube/audio", {
        url,
        target: format,
        bitrate,
      });
      const blob = await res.blob();
      setOutUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
