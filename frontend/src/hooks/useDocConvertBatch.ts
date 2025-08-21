import { useEffect, useState } from "react";
import { postConvertBatch } from "@/lib/api";
import type { DocFormat } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook to perform batch document conversion and provide a downloadable ZIP URL.
 *
 * Returns:
 * - busy: boolean indicating an ongoing conversion
 * - zipUrl: object URL pointing to the resulting ZIP blob (or null)
 * - convert: function to start a conversion given files and a target format
 * - clear: function to revoke the current object URL and clear state
 */
export function useDocConvertBatch() {
  const [busy, setBusy] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // Revoke the object URL when the component using this hook unmounts
  // or when zipUrl changes to avoid memory leaks.
  useEffect(
    () => () => {
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    },
    [zipUrl]
  );

  /**
   * Convert a list of File objects to the specified target format.
   * Creates an object URL for the resulting ZIP blob and stores it in state.
   *
   * @param files - array of File instances to convert
   * @param target - desired output document format
   */
  async function convert(files: File[], target: DocFormat) {
    if (!files.length) return;
    setBusy(true);
    setZipUrl(null);

    try {
      // Send files to the API with a custom header specifying the target format.
      const headers = { "x-target": target };
      const zipBlob = await postConvertBatch(
        "/doc/convert-batch",
        files,
        headers
      );

      // Create a temporary object URL for the downloaded blob so it can be used
      // as an href for an <a> element or similar.
      setZipUrl(URL.createObjectURL(zipBlob));
      toast.success("Document conversion completed successfully.", {
        style: {
          "--normal-bg": "var(--background)",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    } catch (e) {
      // Log the error and surface a styled toast to the user.
      console.error(e);
      toast.error("Document conversion failed.", {
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
   * Revoke the current object URL (if any) and clear the stored URL from state.
   * Useful after the user has downloaded the ZIP to free memory.
   */
  function clear() {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
  }

  return { busy, zipUrl, convert, clear };
}
