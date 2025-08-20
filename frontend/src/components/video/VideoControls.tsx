// src/components/video/VideoControls.tsx
// Controls for video conversion options: format, quality (CRF), preset,
// audio settings, resizing and FPS.

// External libraries first
import { Info as InfoIcon } from "lucide-react";

// UI primitives and components
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

// Local types
import type { VideoFormat } from "@/lib/types";
import { VIDEO_FORMATS } from "@/lib/constants";

/**
 * Props for VideoControls
 * - format: selected container/codec
 * - setFormat: setter for format
 * - crf / setCrf: quality control (lower = better quality)
 * - preset / setPreset: encoder speed preset
 * - audioKbps / setAudioKbps: audio bitrate in kbps
 * - maxW / maxH: optional maximum width/height in pixels
 * - fps / setFps: optional frames-per-second override
 * - disabled: optional flag to disable inputs (e.g. while converting)
 */
type Props = {
  format: VideoFormat;
  setFormat: (f: VideoFormat) => void;
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
  disabled?: boolean;
};

/**
 * FieldLabel
 * Small helper to show a label with an info tooltip next to it.
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
 * VideoControls
 * Renders primary format selection and an accordion with advanced options.
 */
export function VideoControls({
  format,
  setFormat,
  crf,
  setCrf,
  preset,
  setPreset,
  audioKbps,
  setAudioKbps,
  maxW,
  setMaxW,
  maxH,
  setMaxH,
  fps,
  setFps,
  disabled,
}: Props) {
  return (
    <div className="grid gap-5 p-3 bg-white/60 rounded-xl shadow-sm">
      {/* Primary, simple field: output format */}
      <div className="space-y-2">
        <FieldLabel
          tip={
            <>
              <b>Select the container and codec for your video:</b>
              <ul className="list-disc ml-4 mt-1">
                <li>
                  <b>MP4/MOV:</b> H.264 + AAC (very compatible)
                </li>
                <li>
                  <b>WebM:</b> VP9 + Opus (open, modern web)
                </li>
                <li>
                  <b>MKV:</b> Flexible container, many codecs
                </li>
                <li>
                  <b>AVI/FLV:</b> Legacy formats, limited use
                </li>
              </ul>
            </>
          }
        >
          Output format
        </FieldLabel>
        <Select
          value={format}
          onValueChange={(v) => setFormat(v as VideoFormat)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
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

      {/* Advanced options grouped in an accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced options</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-5 sm:grid-cols-3">
              {/* CRF: quality control for video encoders */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>CRF controls quality with variable bitrate:</b>
                      <ul className="list-disc ml-4 mt-1">
                        <li>
                          <b>x264:</b> 18–24 (≈21 good balance)
                        </li>
                        <li>
                          <b>VP9:</b> 24–32 (≈28 standard)
                        </li>
                        <li>Lower value = higher quality & larger file</li>
                      </ul>
                    </>
                  }
                >
                  Quality (CRF): {crf}
                </FieldLabel>
                <Slider
                  value={[crf]}
                  min={18}
                  max={32}
                  step={1}
                  onValueChange={([v]) => setCrf(v)}
                  disabled={disabled}
                />
              </div>

              {/* Preset: encoding speed/efficiency tradeoff */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Encoder speed vs size:</b> Slower = better compression
                      (smaller file) but longer processing.
                    </>
                  }
                >
                  Preset (encoding speed)
                </FieldLabel>
                <Select
                  value={preset}
                  onValueChange={setPreset}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose..." />
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

              {/* Audio bitrate control */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Audio quality:</b>
                      <ul className="list-disc ml-4 mt-1">
                        <li>Standard video: 128–160 kbps</li>
                        <li>High fidelity: 192–256 kbps</li>
                      </ul>
                    </>
                  }
                >
                  Audio bitrate (kbps)
                </FieldLabel>
                <Input
                  type="number"
                  min={64}
                  max={320}
                  step={16}
                  value={audioKbps}
                  onChange={(e) => setAudioKbps(Number(e.target.value))}
                  disabled={disabled}
                />
              </div>

              {/* Max width */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Resize:</b> If only width is set, height is adjusted to
                      keep aspect ratio.
                    </>
                  }
                >
                  Max width (px)
                </FieldLabel>
                <Input
                  type="number"
                  min={16}
                  placeholder="(optional)"
                  value={maxW === "" ? "" : maxW}
                  onChange={(e) =>
                    setMaxW(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={disabled}
                />
              </div>

              {/* Max height */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Resize:</b> If only height is set, width is adjusted to
                      keep aspect ratio.
                    </>
                  }
                >
                  Max height (px)
                </FieldLabel>
                <Input
                  type="number"
                  min={16}
                  placeholder="(optional)"
                  value={maxH === "" ? "" : maxH}
                  onChange={(e) =>
                    setMaxH(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={disabled}
                />
              </div>

              {/* FPS override */}
              <div className="space-y-2 sm:col-span-3">
                <FieldLabel
                  tip={
                    <>
                      <b>Frames per second:</b> Leave empty to keep original.
                      Lower FPS reduces size but is less smooth. Standard:
                      24/25/30 • Smoother: 60 • Lightweight: 15
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
                  value={fps === "" ? "" : fps}
                  onChange={(e) =>
                    setFps(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
