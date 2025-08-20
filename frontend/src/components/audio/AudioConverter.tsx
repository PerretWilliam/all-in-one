// src/components/audio/AudioConverter.tsx
// Component that wires together the audio drop area, controls and action bar.

import { useState } from "react";
import { DropArea } from "@/components/common/DropArea";
import { useAudioConvert } from "../../hooks/useAudioConvert";
import { AudioControls } from "@/components/audio/AudioControls";
import { ActionBar } from "@/components/common/ActionBar";
import type { AudioFormat } from "@/lib/types";

/**
 * AudioConverter
 * High-level component composing:
 * - a DropArea to receive an input audio file,
 * - AudioControls to choose format and bitrate,
 * - ActionBar to trigger conversion and download the result.
 *
 * This component only manages UI state and delegates the actual
 * conversion logic to the `useAudioConvert` hook.
 */
export default function AudioConverter() {
  // Currently selected input file (or null when none selected)
  const [file, setFile] = useState<File | null>(null);

  // Desired output format. Default to 'mp3'.
  const [format, setFormat] = useState<AudioFormat>("mp3");

  // Target audio bitrate (in kbps). This value is ignored for lossless
  // formats such as 'wav' by the backend, but kept here for UI control.
  const [bitrate, setBitrate] = useState(192);

  // Base name for the output file (without extension). Defaults to 'output'.
  const [outName, setOutName] = useState("output");

  // Hook providing conversion state and functions:
  // - busy: whether a conversion is in progress
  // - outUrl: URL of the converted file when ready
  // - setOutUrl: setter to clear or set the output URL
  // - convert: function to perform the conversion (file, format, bitrate)
  const { busy, outUrl, setOutUrl, convert } = useAudioConvert();

  /**
   * Handler invoked when the user clicks the Convert button.
   * Performs a no-op if no file is selected. Delegates conversion to the hook.
   */
  async function onConvert() {
    if (!file) return;
    // The conversion runs on the backend via the useAudioConvert hook.
    await convert(file, format, bitrate);
  }

  return (
    <div className="space-y-6">
      {/* Drop area for selecting an audio file. When a file is chosen:
          - update local file state
          - clear any previous output URL
          - set a sensible default output filename based on the input name
      */}
      <DropArea
        accept={{ "audio/*": [] }}
        onFile={(f) => {
          setFile(f);
          setOutUrl(null);
          setOutName(f.name.replace(/\.[^.]+$/, "") || "output");
        }}
        labelIdle="Drag and drop an audio file or click to select"
        labelActive="Drop the audio file here..."
        selected={file}
      />

      {/* Controls for format and bitrate. Disabled while busy. */}
      <AudioControls
        format={format}
        setFormat={setFormat}
        bitrate={bitrate}
        setBitrate={setBitrate}
        disabled={busy}
      />

      {/* Action bar: shows convert/download actions. The download name
          is composed from the chosen base name and the selected format. */}
      <ActionBar
        busy={busy}
        canConvert={Boolean(file)}
        onConvert={onConvert}
        downloadUrl={outUrl ?? undefined}
        downloadName={`${outName}.${format}`}
      />
    </div>
  );
}
