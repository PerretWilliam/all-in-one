// src/components/image/ImageConverter.tsx
// High-level image conversion UI: drop area, controls, and actions.

// External imports
import { useState } from "react";

// Local types/utilities
import { useImageConvert } from "@/hooks/useImageConvert";

// UI components
import { DropArea } from "@/components/common/DropArea";
import { ImageControls } from "@/components/image/ImageControls";
import { ActionBar } from "@/components/common/ActionBar";

// Local types
import type { ImageFormat } from "@/lib/types";

/**
 * ImageConverter
 * Composes the UI pieces required to convert an image file:
 * - a DropArea to pick an input image
 * - ImageControls to select format, quality and resize options
 * - ActionBar to trigger conversion and download the result
 *
 * The component only manages UI state; conversion is handled by the
 * `useImageConvert` hook which performs the backend request.
 */
export function ImageConverter() {
  // Selected input file (null when none)
  const [file, setFile] = useState<File | null>(null);

  // Base name for the produced file (without extension)
  const [resultName, setResultName] = useState("output");

  // Image conversion options and their local UI state
  const [target, setTarget] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [keepAspect, setKeepAspect] = useState(true);

  // Hook that exposes busy state, output URL and the convert function
  const { busy, outUrl, setOutUrl, convert } = useImageConvert();

  /**
   * Trigger conversion via the hook. No-op if no file is selected.
   */
  async function onConvert() {
    if (!file) return;
    await convert(file, {
      target,
      quality,
      maxWidth,
      maxHeight,
      keepAspect,
    });
  }

  return (
    <div className="space-y-6">
      {/* Drop area: update file state and reset previous output URL */}
      <DropArea
        accept={{ "image/*": [] }}
        onFile={(f) => {
          setFile(f);
          setOutUrl(null);
          setResultName(f.name.replace(/\.[^.]+$/, "") || "output");
        }}
        labelIdle="Drag and drop an image or click to select"
        labelActive="Drop the file here..."
        selected={file}
      />

      {/* Controls for format, quality and resizing */}
      <ImageControls
        target={target}
        setTarget={setTarget}
        quality={quality}
        setQuality={setQuality}
        maxWidth={maxWidth}
        setMaxWidth={setMaxWidth}
        maxHeight={maxHeight}
        setMaxHeight={setMaxHeight}
        keepAspect={keepAspect}
        setKeepAspect={setKeepAspect}
        disabled={busy}
      />

      {/* Action bar to start conversion and optionally download result */}
      <ActionBar
        busy={busy}
        canConvert={Boolean(file)}
        onConvert={onConvert}
        downloadUrl={outUrl ?? undefined}
        downloadName={`${resultName}.${target}`}
      />
    </div>
  );
}
