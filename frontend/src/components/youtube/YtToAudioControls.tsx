// src/components/youtube/YtToAudioControls.tsx
// Controls for converting a YouTube video to audio. Handles URL input,
// output format, optional filename and bitrate.
// External libraries first
import { Info as InfoIcon } from "lucide-react";

// UI components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import type { AudioFormat } from "@/lib/types";
import { AUDIO_FORMATS } from "@/lib/constants";

/**
 * Props for the YtToAudioControls component.
 */
type Props = {
  url: string;
  setUrl: (v: string) => void;
  format: AudioFormat;
  setFormat: (f: AudioFormat) => void;
  bitrate: number;
  setBitrate: (n: number) => void;
  fileName: string;
  setFileName: (v: string) => void;
  disabled?: boolean;
};

/**
 * FieldLabel
 * Helper that renders a label with an info tooltip.
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

export function YtToAudioControls({
  url,
  setUrl,
  format,
  setFormat,
  bitrate,
  setBitrate,
  fileName,
  setFileName,
  disabled,
}: Props) {
  return (
    <div className="grid gap-5 p-3 bg-white/60 rounded-xl shadow-sm">
      {/* Primary, simple fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* URL input field spanning both columns */}
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel
            tip={
              <>
                Paste the YouTube video link you want to convert to audio.
                <br />
                The video must be public or accessible.
              </>
            }
          >
            YouTube URL
          </FieldLabel>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Output format selector */}
        <div className="space-y-2">
          <FieldLabel
            tip={
              <>
                <b>Choose the output format:</b>
                <ul className="list-disc ml-4 mt-1">
                  <li>
                    <b>MP3:</b> works everywhere
                  </li>
                  <li>
                    <b>AAC:</b> great on Apple/mobile
                  </li>
                  <li>
                    <b>OGG/Opus:</b> efficient quality, smaller files
                  </li>
                  <li>
                    <b>WAV:</b> lossless, very large files
                  </li>
                </ul>
              </>
            }
          >
            Output format
          </FieldLabel>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as AudioFormat)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {AUDIO_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File name input */}
        <div className="space-y-2">
          <FieldLabel
            tip={<>This name will be used for the downloaded file.</>}
          >
            File name
          </FieldLabel>
          <Input
            placeholder="youtube-audio"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Advanced options (bitrate) */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced options</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Bitrate */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Audio quality:</b> Higher value = better quality and
                      larger file size.
                      <br />
                      128–160 kbps is enough for most videos; 192–256 kbps for
                      higher fidelity. (Ignored for WAV.)
                    </>
                  }
                >
                  Bitrate (kbps)
                </FieldLabel>
                <Input
                  type="number"
                  min={32}
                  max={320}
                  step={16}
                  value={bitrate}
                  onChange={(e) => setBitrate(Number(e.target.value))}
                  disabled={disabled || format === "wav"}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
