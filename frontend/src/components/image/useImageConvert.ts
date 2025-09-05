// src/components/image/useImageConvert.ts
import { useState } from "react";
import {
  decodeToImageData,
  maybeResize,
  encodeByTarget,
  type TargetFormat,
} from "@/lib/imageCodecs";

// Comments in English
export function useImageConvert() {
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  async function convert(
    file: File,
    params: {
      target: TargetFormat;
      quality: number; // 1..100 (ignored for PNG)
      maxWidth?: number | "";
      maxHeight?: number | "";
      keepAspect: boolean;
    }
  ) {
    setBusy(true);
    setOutUrl(null);
    try {
      const buf = await file.arrayBuffer();
      const decoded = await decodeToImageData(buf);
      const resized = await maybeResize(decoded, {
        maxWidth: params.maxWidth,
        maxHeight: params.maxHeight,
        keepAspect: params.keepAspect,
      });
      const blob = await encodeByTarget(resized, params.target, params.quality);
      setOutUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
