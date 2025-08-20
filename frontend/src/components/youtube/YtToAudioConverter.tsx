// src/components/youtube/YtToAudioConverter.tsx
// Page-level component that ties together the YouTube->audio controls and actions.

// External imports
import { useState } from "react";

// Hook and types
import { useYtToAudio } from "../../hooks/useYtToAudio";

// Local UI components
import { ActionBar } from "@/components/common/ActionBar";
import { YtToAudioControls } from "@/components/youtube/YtToAudioControls";
import type { AudioFormat } from "@/lib/types";

/**
 * YtToAudioConverter
 * Manages local UI state for converting a YouTube URL into an audio file.
 * Delegates conversion work to the `useYtToAudio` hook.
 */
export default function YtToAudioConverter() {
  // Local UI state
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [fileName, setFileName] = useState("youtube-audio");

  // Hook handling the conversion process and providing output URL
  const { busy, outUrl, setOutUrl, convert } = useYtToAudio();

  // Called when the user triggers the export. No-op if URL is empty.
  async function onConvert() {
    if (!url) return;
    setOutUrl(null);
    await convert(url, format, bitrate);
  }

  return (
    <div className="space-y-6">
      <YtToAudioControls
        url={url}
        setUrl={(v) => {
          setUrl(v);
          setOutUrl(null);
        }}
        format={format}
        setFormat={(f) => {
          setFormat(f);
          setOutUrl(null);
        }}
        bitrate={bitrate}
        setBitrate={(n) => {
          setBitrate(n);
          setOutUrl(null);
        }}
        fileName={fileName}
        setFileName={setFileName}
        disabled={busy}
      />

      <ActionBar
        busy={busy}
        canConvert={!!url}
        onConvert={onConvert}
        downloadUrl={outUrl || undefined}
        downloadName={`${fileName || "youtube-audio"}.${format}`}
        convertLabel="Export"
      />
    </div>
  );
}
