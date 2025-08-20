/**
 * hooks/useYtToVideo.ts
 *
 * Hook to request a video conversion for a given YouTube URL.
 * - Posts JSON to the backend describing the desired output format and
 *   encoding parameters. The server returns a video blob which is exposed
 *   to callers as a local object URL (`outUrl`).
 */

import { useState } from "react";
import { postJsonBlob } from "@/lib/api";
import type { VideoFormat } from "@/lib/types";

export function useYtToVideo() {
  // Whether a conversion request is currently running
  const [busy, setBusy] = useState(false);
  // Local blob URL for the converted video returned by the backend
  const [outUrl, setOutUrl] = useState<string | null>(null);

  /**
   * convert
   * - opts: conversion options (url, target format, quality/preset, audio bitrate,
   *   optional resize/fps overrides)
   *
   * The function constructs a minimal body from the provided options and posts
   * it to the backend. On success the returned blob is converted to an object
   * URL so the UI can present a download link.
   */
  async function convert(opts: {
    url: string;
    target: VideoFormat;
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
