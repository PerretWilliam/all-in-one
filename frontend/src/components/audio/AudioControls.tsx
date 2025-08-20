// AudioControls.tsx
// Component that provides UI controls for selecting audio output format and bitrate.

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
import { InfoIcon } from "lucide-react";
import type { AudioFormat } from "@/lib/types";
import { AUDIO_FORMATS } from "@/lib/constants";

/**
 * Props for the AudioControls component.
 * - format: current selected audio format (e.g. 'mp3', 'wav')
 * - setFormat: setter callback to change the format
 * - bitrate: numeric bitrate value in kbps
 * - setBitrate: setter callback to change the bitrate
 * - disabled: optional flag to disable inputs (e.g. while converting)
 */
type Props = {
  format: AudioFormat;
  setFormat: (f: AudioFormat) => void;
  bitrate: number;
  setBitrate: (n: number) => void;
  disabled?: boolean;
};

/**
 * AudioControls
 * Renders two main controls:
 * 1) A select for choosing the output audio format.
 * 2) A numeric input for choosing the target bitrate (kbps).
 *
 * Notes:
 * - When the selected format is 'wav' the bitrate input is disabled because
 *   WAV is lossless and the bitrate setting is ignored.
 * - The component does not perform any conversion itself; it only exposes
 *   the selected options via callbacks provided in props.
 */
export function AudioControls({
  format,
  setFormat,
  bitrate,
  setBitrate,
  disabled,
}: Props) {
  return (
    // Layout container: two-column grid on small+ screens, single column on xs
    <div className="grid gap-6 sm:grid-cols-2 p-3 bg-white/60 rounded-xl shadow-sm">
      {/* Output format selector block */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Label for the format selector */}
          <Label>Output format</Label>
          {/* Tooltip explaining available formats */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground">
                <InfoIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              <b>Select the format for your converted audio file:</b>
              <ul className="list-disc ml-4 mt-1">
                <li>
                  <b>MP3 / AAC:</b> Highly compatible with most devices and
                  apps.
                </li>
                <li>
                  <b>OGG / Opus:</b> Excellent quality at low bitrates, modern
                  web support.
                </li>
                <li>
                  <b>WAV:</b> Lossless, very large files, ignores bitrate
                  setting.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Controlled Select component: value and change handler come from props */}
        <Select
          value={format}
          onValueChange={(v) => setFormat(v as AudioFormat)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
          <SelectContent>
            {/* Each SelectItem maps to an AudioFormat value */}
            {AUDIO_FORMATS.map((format) => (
              <SelectItem key={format} value={format}>
                {format.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bitrate configuration block */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Bitrate (kbps)</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground">
                <InfoIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              <b>Set the audio quality:</b>
              <br />
              Higher bitrate means better quality and larger file size.
              <ul className="list-disc ml-4 mt-1">
                <li>
                  <b>Voice:</b> 96–128 kbps
                </li>
                <li>
                  <b>Music:</b> 192–256 kbps
                </li>
                <li>
                  <b>WAV:</b> Always lossless, ignores this setting.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        {/*
          Numeric input for bitrate. The control is disabled when:
          - the chosen format is 'wav' (lossless), or
          - the parent has disabled controls (e.g. during processing).
        */}
        <Input
          type="number"
          min={32}
          max={320}
          step={16}
          value={bitrate}
          onChange={(e) => setBitrate(Number(e.target.value))}
          disabled={format === "wav" || disabled}
        />
      </div>
    </div>
  );
}
