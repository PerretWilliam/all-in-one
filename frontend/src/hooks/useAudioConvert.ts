/**
 * hooks/useAudioConvert.ts
 *
 * Hook that wraps the audio conversion API call.
 * - Exposes a `convert` function that posts a file to the server and returns
 *   a blob URL for download via `outUrl` when the conversion completes.
 * - Keeps simple busy state while conversion runs.
 */

import { useState } from "react";
import { postConvert } from "@/lib/api";
import type { AudioFormat } from "@/lib/types";

export function useAudioConvert() {
  // Whether a conversion is in progress
  const [busy, setBusy] = useState(false);
  // Blob URL returned by the server after a successful conversion
  const [outUrl, setOutUrl] = useState<string | null>(null);

  /**
   * convert
   * - Posts the provided file to the backend convert endpoint with headers
   *   that indicate the requested target format and bitrate.
   * - On success creates a local object URL for the returned blob so callers
   *   can use it as a download link.
   */
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
      // User-facing message in English
      alert("Audio conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
