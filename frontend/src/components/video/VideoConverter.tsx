// src/components/video/VideoConverter.tsx
// High-level video conversion UI: drop area, options and actions.

// External imports
import { useState } from "react";

// Local Types
import type { VideoFormat } from "@/lib/types";

// Hook
import { useVideoConvertBatch } from "@/hooks/useVideoConvertBatch";

// UI components
import { DropArea } from "@/components/common/DropArea";
import { VideoControls } from "@/components/video/VideoControls";
import { ActionBar } from "@/components/common/ActionBar";

/**
 * VideoConverter
 * Combines the DropArea, VideoControls and ActionBar into a single UI.
 * Manages local form state and delegates the conversion process to the
 * useVideoConvertBatch hook.
 */
export default function VideoConverter() {
  // Conversion options with sensible defaults
  const [format, setFormat] = useState<VideoFormat>("mp4"); // output format
  const [crf, setCrf] = useState(23); // quality (constant rate factor)
  const [preset, setPreset] = useState("veryfast"); // ffmpeg preset for speed/quality tradeoff
  const [audioKbps, setAudioKbps] = useState(128); // audio bitrate in kbps
  const [maxW, setMaxW] = useState<number | "">(""); // optional max width
  const [maxH, setMaxH] = useState<number | "">(""); // optional max height
  const [fps, setFps] = useState<number | "">(""); // optional target framerate

  // Files selected by the user
  const [files, setFiles] = useState<File[]>([]);

  // Hook controlling the conversion process and resulting download URL
  const { busy, zipUrl, convert } = useVideoConvertBatch();

  return (
    <div className="space-y-6">
      {/* File drop area: updates selected files when user drops or picks files */}
      <DropArea
        accept={{ "video/*": [] }}
        onFiles={setFiles}
        labelIdle="Drag and drop video files or click to select"
        labelActive="Drop video files here..."
        selected={files}
      />

      {/* Video option controls: format, quality, preset, audio and sizing */}
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

      {/* Action bar: start conversion and download resulting ZIP when ready */}
      <ActionBar
        busy={busy}
        canConvert={files.length > 0}
        onConvert={() =>
          convert(files, { format, crf, preset, audioKbps, maxW, maxH, fps })
        }
        downloadUrl={zipUrl}
        downloadName="converted-video.zip"
        convertLabel={files.length > 1 ? "Convert all" : "Convert"}
        convertingLabel="Converting…"
      />
    </div>
  );
}
