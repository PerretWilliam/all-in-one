// src/components/video/VideoConverter.tsx
// High-level video conversion UI: drop area, options and actions.

// External imports
import { useState } from "react";

// Hook and types
import { useVideoConvert } from "@/hooks/useVideoConvert";

// UI components
import { DropArea } from "@/components/common/DropArea";
import { VideoControls } from "@/components/video/VideoControls";
import { ActionBar } from "@/components/common/ActionBar";

// Local Types
import type { VideoFormat } from "@/lib/types";

/**
 * VideoConverter
 * Composes the video DropArea, VideoControls and ActionBar. Manages local
 * UI state and delegates the actual conversion to the `useVideoConvert` hook.
 */
export default function VideoConverter() {
  // Selected input file
  const [file, setFile] = useState<File | null>(null);

  // Conversion options with sensible defaults
  const [format, setFormat] = useState<VideoFormat>("mp4"); // default to mp4
  const [crf, setCrf] = useState(23);
  const [preset, setPreset] = useState("veryfast");
  const [audioKbps, setAudioKbps] = useState(128);
  const [maxW, setMaxW] = useState<number | "">("");
  const [maxH, setMaxH] = useState<number | "">("");
  const [fps, setFps] = useState<number | "">("");
  const [outName, setOutName] = useState("output");

  // Hook controlling conversion process and output URL
  const { busy, outUrl, setOutUrl, convert } = useVideoConvert();

  // Trigger conversion; no-op when no file is selected
  async function onConvert() {
    if (!file) return;
    await convert(file, { format, crf, preset, audioKbps, maxW, maxH, fps });
  }

  return (
    <div className="space-y-6">
      {/* File drop area. When a file is selected, update local state and
          clear any previous output URL. */}
      <DropArea
        accept={{ "video/*": [] }}
        onFile={(f) => {
          setFile(f);
          setOutUrl(null);
          setOutName(f.name.replace(/\.[^.]+$/, "") || "output");
        }}
        labelIdle="Drag and drop a video file or click to select"
        labelActive="Drop the video file here..."
        selected={file}
      />

      {/* Controls for video options */}
      <VideoControls
        format={format}
        setFormat={setFormat}
        crf={crf}
        setCrf={setCrf}
        preset={preset}
        setPreset={setPreset}
        audioKbps={audioKbps}
        setAudioKbps={setAudioKbps}
        maxW={maxW}
        setMaxW={setMaxW}
        maxH={maxH}
        setMaxH={setMaxH}
        fps={fps}
        setFps={setFps}
        disabled={busy}
      />

      {/* Action bar for converting and downloading the result */}
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
