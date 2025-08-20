// src/components/image/ImageControls.tsx
// Controls for image conversion options: format, quality, resizing and aspect.

// External libraries first
import { Info as InfoIcon } from "lucide-react";

// UI primitives and components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import type { ImageFormat } from "@/lib/types";
import { IMAGE_FORMATS } from "@/lib/constants";

/**
 * Props for ImageControls
 * - target: selected output image format (webp, avif, jpeg, png)
 * - setTarget: setter for the target format
 * - quality: numeric quality value (1-100)
 * - setQuality: setter for quality
 * - maxWidth / maxHeight: optional resize bounds (pixels) or empty string
 * - setMaxWidth / setMaxHeight: setters for resize bounds
 * - keepAspect: whether to preserve the original aspect ratio when resizing
 * - setKeepAspect: setter for keepAspect
 * - disabled: optional flag to disable controls (e.g. while converting)
 */
type Props = {
  target: ImageFormat;
  setTarget: (t: ImageFormat) => void;
  quality: number;
  setQuality: (n: number) => void;
  maxWidth: number | "";
  setMaxWidth: (n: number | "") => void;
  maxHeight: number | "";
  setMaxHeight: (n: number | "") => void;
  keepAspect: boolean;
  setKeepAspect: (b: boolean) => void;
  disabled?: boolean;
};

/**
 * FieldLabel
 * Small helper that renders a label with an info tooltip.
 * - children: the visible field label text
 * - tip: the tooltip content shown when hovering the info icon
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

export function ImageControls(props: Props) {
  const {
    target,
    setTarget,
    quality,
    setQuality,
    maxWidth,
    setMaxWidth,
    maxHeight,
    setMaxHeight,
    keepAspect,
    setKeepAspect,
    disabled,
  } = props;

  return (
    // Card-like container holding all image control fields
    <div className="grid gap-6 p-3 bg-white/60 rounded-xl shadow-sm">
      {/* Primary, simple field: output format */}
      <div className="space-y-2">
        <FieldLabel
          tip={
            <>
              <b>Choose the format for your converted image:</b>
              <ul className="list-disc ml-4 mt-1">
                <li>
                  <b>WebP</b>: Great quality/size ratio, widely supported.
                </li>
                <li>
                  <b>AVIF</b>: Most efficient, but slower to convert.
                </li>
                <li>
                  <b>JPEG</b>: Best for photos, very compatible.
                </li>
                <li>
                  <b>PNG</b>: Lossless, ideal for logos/graphics.
                </li>
              </ul>
            </>
          }
        >
          Output format
        </FieldLabel>
        <Select
          value={target}
          onValueChange={(v) => setTarget(v as ImageFormat)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
          <SelectContent>
            {IMAGE_FORMATS.map((format) => (
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
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Quality control */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Adjust output quality:</b> Higher = better quality and
                      larger file size.
                      <br />
                      <b>Note:</b> PNG is always lossless, so quality is ignored
                      for PNG.
                    </>
                  }
                >
                  Quality{" "}
                  {target !== "png" ? `(${quality})` : "(ignored for PNG)"}
                </FieldLabel>
                <Slider
                  value={[quality]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setQuality(v)}
                  disabled={disabled || target === "png"}
                />
              </div>

              {/* Max width input */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Resize:</b> Set a maximum width in pixels. If only
                      width is set and <b>Keep aspect ratio</b> is enabled,
                      height will be adjusted automatically.
                    </>
                  }
                >
                  Max width (px)
                </FieldLabel>
                <Input
                  type="number"
                  min={1}
                  placeholder="(optional)"
                  value={maxWidth === "" ? "" : maxWidth}
                  onChange={(e) =>
                    setMaxWidth(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={disabled}
                />
              </div>

              {/* Max height input */}
              <div className="space-y-2">
                <FieldLabel
                  tip={
                    <>
                      <b>Resize:</b> Set a maximum height in pixels. If{" "}
                      <b>Keep aspect ratio</b> is enabled, width is adjusted
                      automatically.
                    </>
                  }
                >
                  Max height (px)
                </FieldLabel>
                <Input
                  type="number"
                  min={1}
                  placeholder="(optional)"
                  value={maxHeight === "" ? "" : maxHeight}
                  onChange={(e) =>
                    setMaxHeight(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={disabled}
                />
              </div>

              {/* Keep aspect ratio switch */}
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={keepAspect}
                  onCheckedChange={setKeepAspect}
                  disabled={disabled}
                  id="keepAspect"
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="keepAspect">Keep aspect ratio</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground">
                        <InfoIcon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm">
                      <b>Preserve the original proportions</b> when resizing.
                      <br />
                      Disable to force exact width/height (may distort the
                      image).
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
