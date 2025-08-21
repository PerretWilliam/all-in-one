// src/components/image/ImageConverter.tsx
// High-level image conversion UI: drop area, controls, and actions.
// Dev-focused comments in English only.

import { useState } from "react";

import type { ImageFormat } from "@/lib/types";

import { useImageConvertBatch } from "@/hooks/useImageConvertBatch";

import { DropArea } from "@/components/common/DropArea";
import { ActionBar } from "@/components/common/ActionBar";
import { ImageControls } from "@/components/image/ImageControls";

/**
 * ImageConverter
 * Composes the UI pieces required to convert image files:
 * - DropArea to pick input images
 * - ImageControls to select format, quality and resize options
 * - ActionBar to trigger conversion and download the result
 *
 * The component manages only UI state; conversion is delegated to
 * the `useImageConvertBatch` hook which performs the backend request.
 */
export function ImageConverter() {
  // Selected input files (multiple files supported)
  const [files, setFiles] = useState<File[]>([]);

  // Conversion options controlled by the UI
  const [target, setTarget] = useState<ImageFormat>("webp"); // output format
  const [quality, setQuality] = useState(80); // 0-100 image quality
  const [maxWidth, setMaxWidth] = useState<number | "">(""); // optional max width
  const [maxHeight, setMaxHeight] = useState<number | "">(""); // optional max height
  const [keepAspect, setKeepAspect] = useState(true); // maintain aspect ratio

  // Hook exposing busy state, resulting zip URL and convert function
  const { busy, zipUrl, convert } = useImageConvertBatch();

  return (
    <div className="space-y-6">
      {/* Drop area: updates file list and resets previous outputs via parent handler */}
      <DropArea
        accept={{ "image/*": [] }}
        onFiles={setFiles}
        labelIdle="Drag and drop images or click to select"
        labelActive="Drop the images here..."
        selected={files}
      />

      {/* Controls for format, quality and resizing (disabled while busy) */}
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

      {/* Action bar: start conversion and optionally download the resulting zip */}
      <ActionBar
        busy={busy}
        canConvert={files.length > 0}
        onConvert={() =>
          convert(files, {
            format: target,
            quality,
            maxWidth,
            maxHeight,
            keepAspect,
          })
        }
        downloadUrl={zipUrl}
        downloadName="converted-images.zip"
        convertLabel={files.length > 1 ? "Convert all" : "Convert"}
      />
    </div>
  );
}
