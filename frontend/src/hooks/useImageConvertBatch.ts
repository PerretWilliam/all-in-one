// Hook to convert multiple images in a batch and provide a downloadable ZIP URL.

import { useEffect, useState } from "react";
import type { ImageFormat } from "@/lib/types";
import { postConvertBatch } from "@/lib/api";
import { toast } from "sonner";

type ImageBatchOptions = {
  format: ImageFormat;
  quality: number;
  maxWidth?: number | "";
  maxHeight?: number | "";
  keepAspect?: boolean;
};

export function useImageConvertBatch() {
  // Indicates whether a conversion request is in progress
  const [busy, setBusy] = useState(false);
  // URL of the created ZIP blob (object URL) or null when none exists
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // Revoke the object URL when the hook is cleaned up or when zipUrl changes
  useEffect(
    () => () => {
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    },
    [zipUrl]
  );

  /**
   * Convert the provided files using the backend batch endpoint.
   * Builds request headers from options, posts the files, and sets an object URL for the returned ZIP blob.
   */
  async function convert(files: File[], opts: ImageBatchOptions) {
    if (!files.length) return;
    setBusy(true);
    setZipUrl(null);

    try {
      // Build headers to instruct the server how to convert the images
      const headers: Record<string, string> = {
        "x-target": opts.format,
        "x-quality": String(opts.quality),
        "x-keep-aspect": String(Boolean(opts.keepAspect)),
      };

      // Only include max width/height headers when they are provided (not empty string or null)
      if (opts.maxWidth !== "" && opts.maxWidth != null)
        headers["x-max-width"] = String(opts.maxWidth);
      if (opts.maxHeight !== "" && opts.maxHeight != null)
        headers["x-max-height"] = String(opts.maxHeight);

      // Send files to the server and receive a ZIP blob in response
      const zipBlob = await postConvertBatch(
        "/image/convert-batch",
        files,
        headers
      );
      // Create an object URL for the ZIP blob so it can be downloaded
      setZipUrl(URL.createObjectURL(zipBlob));

      // Notify success with styled toast
      toast.success("Image conversion completed successfully.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    } catch (e) {
      // Log and notify on failure
      console.error(e);
      toast.error("Image conversion failed.", {
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
   * Clear the current ZIP object URL and revoke it to free resources.
   */
  function clear() {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
  }

  return { busy, zipUrl, convert, clear };
}
