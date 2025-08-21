// src/components/audio/AudioConverter.tsx
// High-level component composed of a file drop area, audio controls and an action bar.

import { useState } from "react";
import type { AudioFormat } from "@/lib/types";

// Hooks
import { useAudioConvertBatch } from "@/hooks/useAudioConvertBatch";

// Presentation / UI pieces
import { DropArea } from "@/components/common/DropArea";
import { AudioControls } from "@/components/audio/AudioControls";
import { ActionBar } from "@/components/common/ActionBar";

/**
 * AudioConverter
 * High-level component composing:
 * - a DropArea to receive input audio files,
 * - AudioControls to choose format and bitrate,
 * - ActionBar to trigger conversion and download the result.
 *
 * This component only manages UI state and delegates the actual
 * conversion logic to the `useAudioConvert` hook.
 */
export default function AudioConverter() {
  // Output format chosen by the user. Keep a typed default to avoid undefined.
  const [format, setFormat] = useState<AudioFormat>("mp3");

  // Target bitrate in kilobits per second. UI-level only; backend decides applicability.
  // Note: some formats (e.g. 'wav') are lossless and may ignore this value.
  const [bitrate, setBitrate] = useState(192);

  // Files selected by the user via the DropArea component.
  // This component intentionally stores File objects and passes them to the hook.
  const [files, setFiles] = useState<File[]>([]);

  // Hook that performs batch conversion and exposes busy state + resulting zip URL.
  const { busy, zipUrl, convert } = useAudioConvertBatch();

  // Convert handler: thin wrapper that delegates to the hook. Keep this component free
  // of conversion implementation details so tests and UI remain simple.

  return (
    <div className="space-y-6">
      {/*
        DropArea
        - Accepts audio files only
        - Calls `setFiles` with an array of File objects when user selects or drops files
        - `selected` prop keeps the UI in sync with local state
      */}
      <DropArea
        accept={{ "audio/*": [] }}
        onFiles={setFiles}
        labelIdle="Drag and drop audio files or click to select"
        labelActive="Drop audio files here..."
        selected={files}
      />

      {/* Controls for selecting format and bitrate. Disabled while conversion is running. */}
      <AudioControls
        format={format}
        setFormat={setFormat}
        bitrate={bitrate}
        setBitrate={setBitrate}
        disabled={busy}
      />

      {/* Action bar: shows convert/download actions. The download name
          is composed from the chosen base name and the selected format. */}
      {/*
        ActionBar
        - Shows Convert button when files are present
        - Shows Download link when `zipUrl` is available
        - onConvert delegates to the conversion hook with current UI state
      */}
      <ActionBar
        busy={busy}
        canConvert={files.length > 0}
        onConvert={() => convert(files, format, bitrate)}
        downloadUrl={zipUrl}
        downloadName="converted-audio.zip"
        convertLabel={files.length > 1 ? "Convert all" : "Convert"}
        convertingLabel="Converting…"
      />
    </div>
  );
}
