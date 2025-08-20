/**
 * hooks/useImageConvert.ts
 *
 * Hook that performs client-side image conversion pipeline:
 * 1. Decode file bytes into ImageData
 * 2. Optionally resize while preserving aspect ratio
 * 3. Encode to the requested target format and quality
 *
 * This hook exposes `convert` and a `busy` flag plus an `outUrl` blob URL
 * that callers can use for downloading the converted image.
 */

import { useState } from "react";
import {
  decodeToImageData,
  maybeResize,
  encodeByTarget,
} from "@/lib/imageCodecs";
import type { ImageFormat } from "@/lib/types";

export function useImageConvert() {
  // Whether a conversion is running
  const [busy, setBusy] = useState(false);
  // Local blob URL for the converted image
  const [outUrl, setOutUrl] = useState<string | null>(null);

  /**
   * convert
   * - file: input image file provided by the user
   * - params: conversion parameters
   *   - target: desired output format (png, jpeg, webp, etc.)
   - quality: 1..100 (ignored for formats that don't use quality setting)
   - maxWidth / maxHeight: optional resize constraints ("" means no constraint)
   - keepAspect: whether to preserve aspect ratio when resizing
   *
   * The function creates an object URL for the returned blob so the UI can
   * present a download link without needing to upload the result to a server.
   */
  async function convert(
    file: File,
    params: {
      target: ImageFormat;
      quality: number; // 1..100 (ignored for PNG)
      maxWidth?: number | "";
      maxHeight?: number | "";
      keepAspect: boolean;
    }
  ) {
    setBusy(true);
    setOutUrl(null);
    try {
      // Read the file bytes
      const buf = await file.arrayBuffer();
      // Decode bytes into ImageData (pixels + metadata)
      const decoded = await decodeToImageData(buf);
      // Optionally resize the decoded image according to constraints
      const resized = await maybeResize(decoded, {
        maxWidth: params.maxWidth,
        maxHeight: params.maxHeight,
        keepAspect: params.keepAspect,
      });
      // Encode the (possibly resized) ImageData to the target format
      const blob = await encodeByTarget(resized, params.target, params.quality);
      // Create a local URL that can be used as a download link
      setOutUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
