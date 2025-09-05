// src/components/audio/useAudioConvert.ts
// Comments in English
import { useState } from "react";
import { postConvert } from "@/lib/api";

export type AudioFormat = "mp3" | "aac" | "ogg" | "opus" | "wav";

export function useAudioConvert() {
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  async function convert(file: File, format: AudioFormat, bitrate: number) {
    setBusy(true);
    setOutUrl(null);
    try {
      const blob = await postConvert("/audio/convert", file, {
        "x-target": format,
        "x-bitrate": String(bitrate),
      });
      setOutUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      alert("Conversion audio (backend) échouée.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
