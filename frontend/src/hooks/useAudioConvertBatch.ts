// hooks/useAudioConvertBatch.ts
// Custom React hook to handle batch audio conversion and provide a downloadable ZIP URL.

import { useEffect, useState } from "react";
import type { AudioFormat } from "@/lib/types";
import { postConvertBatch } from "@/lib/api";
import { toast } from "sonner";

export function useAudioConvertBatch() {
  // busy: indicates whether a conversion is in progress
  const [busy, setBusy] = useState(false);
  // zipUrl: object URL pointing to the converted ZIP blob (or null)
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // Cleanup any created object URL when the hook consumer unmounts
  // or when zipUrl changes to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    };
  }, [zipUrl]);

  // convert: send files to server for batch conversion with given format and bitrate.
  // On success, create an object URL for the returned ZIP blob and expose it via zipUrl.
  async function convert(files: File[], format: AudioFormat, bitrate: number) {
    if (!files.length) return;
    setBusy(true);
    setZipUrl(null);
    try {
      const zipBlob = await postConvertBatch("/audio/convert-batch", files, {
        "x-target": format,
        "x-bitrate": String(bitrate),
      });
      setZipUrl(URL.createObjectURL(zipBlob));
      toast.success("Audio conversion completed successfully.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    } catch (e) {
      console.error(e);
      toast.error("Audio conversion failed.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--destructive)",
          "--normal-border": "var(--destructive)",
        } as React.CSSProperties,
      });
    } finally {
      setBusy(false);
    }
  }

  // clear: revoke the current object URL (if any) and reset state.
  function clear() {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
  }

  return { busy, zipUrl, convert, clear };
}
