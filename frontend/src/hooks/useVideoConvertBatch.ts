import { useEffect, useState } from "react";
import type { VideoFormat } from "@/lib/types";
import { postConvertBatch } from "@/lib/api";
import { toast } from "sonner";

/**
 * Hook to convert a batch of videos on the server and provide a downloadable ZIP URL.
 *
 * - busy: whether a conversion is in progress
 * - zipUrl: object URL for the resulting ZIP blob (or null)
 * - convert: performs the batch conversion given files and options
 * - clear: revokes and clears the current zipUrl
 */
export function useVideoConvertBatch() {
  // Indicates whether a conversion request is currently running
  const [busy, setBusy] = useState(false);
  // Stores an object URL for the returned ZIP blob so the UI can provide a download link
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // Revoke the object URL when the hook consumer unmounts or when zipUrl changes
  useEffect(
    () => () => {
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    },
    [zipUrl]
  );

  type VideoBatchOptions = {
    format: VideoFormat;
    crf: number;
    preset: string;
    audioKbps: number;
    maxW?: number | "";
    maxH?: number | "";
    fps?: number | "";
  };

  /**
   * Send files to the server to convert them in batch.
   * Builds necessary headers from options, calls the API, and sets an object URL for the returned ZIP blob.
   */
  async function convert(files: File[], opts: VideoBatchOptions) {
    if (!files.length) return;
    setBusy(true);
    setZipUrl(null);

    try {
      // Prepare headers conveying conversion options to the backend
      const headers: Record<string, string> = {
        "x-target": opts.format,
        "x-crf": String(opts.crf),
        "x-preset": opts.preset,
        "x-audio-kbps": String(opts.audioKbps),
      };
      if (opts.maxW !== "" && opts.maxW != null)
        headers["x-max-w"] = String(opts.maxW);
      if (opts.maxH !== "" && opts.maxH != null)
        headers["x-max-h"] = String(opts.maxH);
      if (opts.fps !== "" && opts.fps != null)
        headers["x-fps"] = String(opts.fps);

      // Call API to perform conversion and receive a ZIP blob
      const zipBlob = await postConvertBatch(
        "/video/convert-batch",
        files,
        headers
      );

      // Create an object URL so the UI can link to/download the ZIP
      setZipUrl(URL.createObjectURL(zipBlob));
      toast.success("Video conversion completed successfully.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    } catch (e) {
      // Log and show a simple user-facing error
      console.error(e);
      toast.error("Video batch conversion failed.", {
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

  /**
   * Revoke and clear the current ZIP object URL.
   * Consumers should call this when the URL is no longer needed.
   */
  function clear() {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
  }

  return { busy, zipUrl, convert, clear };
}
