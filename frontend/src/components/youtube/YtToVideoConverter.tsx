// src/components/youtube/YtToVideoConverter.tsx

// Page component that allows converting a YouTube URL into a video file.
// - Maintains local form state for conversion options (format, crf, preset, audio bitrate, resize, fps, filename).
// - Calls the `useYtToVideo` hook to perform the conversion and receives an output URL for download.

import { useState } from "react";
import { useYtToVideo } from "@/hooks/useYtToVideo";
import { YtToVideoControls } from "@/components/youtube/YtToVideoControls";
import { ActionBar } from "@/components/common/ActionBar";
import type { VideoFormat } from "@/lib/types";

/**
 * YtToVideoConverter
 * Renders the controls for YouTube -> video conversion and the action bar.
 * Keeps form state here and invokes the conversion function from the hook.
 */
export default function YtToVideoConverter() {
  // The YouTube URL to convert
  const [url, setUrl] = useState("");
  // Target video container/format (e.g. 'mp4', 'webm')
  const [target, setTarget] = useState<VideoFormat>("mp4");
  // CRF (quality) for video encoding; lower means better quality
  const [crf, setCrf] = useState(23);
  // FFmpeg preset to control encoder speed/quality tradeoff
  const [preset, setPreset] = useState("veryfast");
  // Audio bitrate in kbps
  const [audioKbps, setAudioKbps] = useState(128);
  // Optional maximum width/height to resize the video (empty means no constraint)
  const [maxW, setMaxW] = useState<number | "">("");
  const [maxH, setMaxH] = useState<number | "">("");
  // Optional frames-per-second override
  const [fps, setFps] = useState<number | "">("");
  // Default filename (without extension) used for downloads
  const [fileName, setFileName] = useState("youtube-video");

  // Hook providing conversion state and the convert function
  const { busy, outUrl, convert } = useYtToVideo();

  /**
   * onConvert
   * - Validate minimal input (non-empty URL) then call the hook's convert function.
   * - The hook handles the async conversion and sets `outUrl` when ready.
   */
  async function onConvert() {
    if (!url.trim()) return; // do not run if URL is empty
    await convert({
      url,
      target,
      crf,
      preset,
      audioKbps,
      maxW,
      maxH,
      fps,
    });
  }

  return (
    <div className="space-y-6">
      <YtToVideoControls
        url={url}
        setUrl={setUrl}
        target={target}
        setTarget={setTarget}
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
        fileName={fileName}
        setFileName={setFileName}
        disabled={busy}
      />

      <ActionBar
        busy={busy}
        canConvert={!!url}
        onConvert={onConvert}
        downloadUrl={outUrl || undefined}
        downloadName={`${fileName || "youtube-video"}.${target}`}
        convertLabel="Export"
        convertingLabel="Exporting..."
      />
    </div>
  );
}
