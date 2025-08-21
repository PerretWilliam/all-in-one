/**
 * hooks/useYtToAudio.ts
 *
 * Hook to request an audio extraction from a YouTube URL.
 * - Sends a POST JSON request to the backend with the URL and desired
 *   target format / bitrate.
 * - Exposes `busy` flag while the request is in progress and `outUrl` as a
 *   local blob URL when the server returns the audio file.
 */

import { useState } from "react";
import { postJson } from "@/lib/api";
import type { AudioFormat } from "@/lib/types";
import { toast } from "sonner";

export function useYtToAudio() {
  // Whether a conversion request is in progress
  const [busy, setBusy] = useState(false);
  // Local object URL for the converted audio returned by the backend
  const [outUrl, setOutUrl] = useState<string | null>(null);

  /**
   * convert
   * - url: YouTube URL to extract audio from
   * - format: desired audio format
   * - bitrate: requested audio bitrate in kbps
   *
   * The function posts JSON to the server and converts the response to a
   * blob URL usable as a download link. It intentionally does not swallow
   * errors (errors will bubble to the caller) but ensures the busy flag is
   * cleared in a finally block.
   */
  async function convert(url: string, format: AudioFormat, bitrate: number) {
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
      toast.success("Youtube Audio export completed successfully.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    } catch (e) {
      toast.error("Youtube Audio export failed.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--destructive)",
          "--normal-border": "var(--destructive)",
        } as React.CSSProperties,
      });
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
