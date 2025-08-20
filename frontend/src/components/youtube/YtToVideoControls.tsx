// src/components/youtube/YtToVideoControls.tsx
// Controls for converting a YouTube video to a downloadable video file.
// Provides URL input, target format, filename and advanced video options.

// External libraries
import { Info as InfoIcon } from "lucide-react";

// UI components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { VideoFormat } from "@/lib/types";
import { VIDEO_FORMATS } from "@/lib/constants";

/**
 * Props for the YouTube->Video controls component.
 */
type Props = {
  url: string;
  setUrl: (s: string) => void;
  target: VideoFormat;
  setTarget: (t: VideoFormat) => void;
  crf: number;
  setCrf: (n: number) => void;
  preset: string;
  setPreset: (s: string) => void;
  audioKbps: number;
  setAudioKbps: (n: number) => void;
  maxW: number | "";
  setMaxW: (n: number | "") => void;
  maxH: number | "";
  setMaxH: (n: number | "") => void;
  fps: number | "";
  setFps: (n: number | "") => void;
  fileName: string;
  setFileName: (v: string) => void;
  disabled?: boolean;
};

/**
 * FieldLabel
 * Small helper that renders a label with an info tooltip next to it.
 */
function FieldLabel({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground">
            <InfoIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">{tip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * YtToVideoControls
 * Renders the form for entering a YouTube URL and selecting video options
 * including format, quality, preset, audio bitrate and resizing.
 */
export function YtToVideoControls(p: Props) {
  return (
    <div className="grid gap-5 p-3 bg-white/60 rounded-xl shadow-sm">
      {/* Main block: simple */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* URL */}
        <div className="space-y-2 sm:col-span-3">
          <FieldLabel
            tip={
              <>
                Paste the YouTube link you want to convert.
                <br />
                The video must be public or accessible.
              </>
            }
          >
            YouTube URL
          </FieldLabel>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={p.url}
            onChange={(e) => p.setUrl(e.target.value)}
            disabled={p.disabled}
          />
        </div>

        {/* Format */}
        <div className="space-y-2">
          <FieldLabel
            tip={
              <>
                <b>Choose the output format:</b>
                <ul className="list-disc ml-4 mt-1">
                  <li>
                    <b>MP4:</b> most compatible (recommended)
                  </li>
                  <li>
                    <b>WebM:</b> modern (VP9/Opus)
                  </li>
                  <li>
                    <b>MKV:</b> very versatile
                  </li>
                  <li>
                    <b>MOV:</b> Apple ecosystem
                  </li>
                  <li>
                    <b>AVI/FLV:</b> old formats
                  </li>
                </ul>
              </>
            }
          >
            Output format
          </FieldLabel>
          <Select
            value={p.target}
            onValueChange={(v) => p.setTarget(v as VideoFormat)}
            disabled={p.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File name */}
        <div className="space-y-2">
          <FieldLabel tip={<>Name used for the downloaded file.</>}>
            File name
          </FieldLabel>
          <Input
            placeholder="youtube-video"
            value={p.fileName}
            onChange={(e) => p.setFileName(e.target.value)}
            disabled={p.disabled}
          />
        </div>
      </div>

      {/* Advanced options */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced options</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-5 sm:grid-cols-3">
              {/* CRF */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Video quality:</b> lower = better quality (larger
                      file). Recommended: 18–24 for MP4 (H.264), 24–32 for WebM
                      (VP9).
                    </>
                  }
                >
                  Quality (CRF) — {p.crf}
                </FieldLabel>
                <Slider
                  value={[p.crf]}
                  min={18}
                  max={32}
                  step={1}
                  onValueChange={([v]) => p.setCrf(v)}
                  disabled={p.disabled}
                />
              </div>

              {/* Preset */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Encoding speed:</b> slower means better compression
                      (but takes longer).
                    </>
                  }
                >
                  Preset (encoding speed)
                </FieldLabel>
                <Select
                  value={p.preset}
                  onValueChange={p.setPreset}
                  disabled={p.disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultrafast">ultrafast</SelectItem>
                    <SelectItem value="superfast">superfast</SelectItem>
                    <SelectItem value="veryfast">veryfast</SelectItem>
                    <SelectItem value="faster">faster</SelectItem>
                    <SelectItem value="fast">fast</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="slow">slow</SelectItem>
                    <SelectItem value="slower">slower</SelectItem>
                    <SelectItem value="veryslow">veryslow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audio kbps */}
              <div className="space-y-2">
                <FieldLabel tip={<>128–192 kbps is enough for most videos.</>}>
                  Audio (kbps)
                </FieldLabel>
                <Input
                  type="number"
                  min={64}
                  max={320}
                  step={16}
                  value={p.audioKbps}
                  onChange={(e) => p.setAudioKbps(Number(e.target.value))}
                  disabled={p.disabled}
                />
              </div>

              {/* Max width */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      Limits the width. Height adjusts to keep the aspect ratio.
                    </>
                  }
                >
                  Max width (px)
                </FieldLabel>
                <Input
                  type="number"
                  min={16}
                  placeholder="(optional)"
                  value={p.maxW === "" ? "" : p.maxW}
                  onChange={(e) =>
                    p.setMaxW(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={p.disabled}
                />
              </div>

              {/* Max height */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      Limits the height. Width adjusts to keep the aspect ratio.
                    </>
                  }
                >
                  Max height (px)
                </FieldLabel>
                <Input
                  type="number"
                  min={16}
                  placeholder="(optional)"
                  value={p.maxH === "" ? "" : p.maxH}
                  onChange={(e) =>
                    p.setMaxH(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={p.disabled}
                />
              </div>

              {/* FPS */}
              <div className="space-y-2 sm:col-span-3">
                <FieldLabel
                  tip={
                    <>
                      Leave empty to keep the original frame rate. Fewer frames
                      = smaller file but less smooth motion.
                    </>
                  }
                >
                  FPS
                </FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="(optional)"
                  value={p.fps === "" ? "" : p.fps}
                  onChange={(e) =>
                    p.setFps(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={p.disabled}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
