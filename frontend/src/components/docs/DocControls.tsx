// src/components/doc/DocControls.tsx
// Document controls used by the converter UI: select output format and view advanced notes.
// All comments are in English.

import type { DocFormat } from "@/lib/types";

import { Info as InfoIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
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
import { DOC_FORMATS } from "@/lib/constants";

type Props = {
  format: DocFormat;
  setFormat: (f: DocFormat) => void;
  disabled?: boolean;
};

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

export function DocControls({ format, setFormat, disabled }: Props) {
  return (
    <div className="grid gap-6 p-3 bg-white/60 rounded-xl shadow-sm">
      {/* Primary field */}
      <div className="space-y-2">
        <FieldLabel
          tip={
            <>
              <b>Choose your output format:</b>
              <ul className="list-disc ml-4 mt-1">
                <li>
                  <b>PDF</b>: best for sharing and printing.
                </li>
                <li>
                  <b>DOCX/ODT/RTF</b>: editable document formats.
                </li>
                <li>
                  <b>HTML</b>: web page output.
                </li>
                <li>
                  <b>TXT</b>: plain text (no formatting).
                </li>
              </ul>
            </>
          }
        >
          Output format
        </FieldLabel>

        <Select
          value={format}
          onValueChange={(v) => setFormat(v as DocFormat)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
          <SelectContent>
            {DOC_FORMATS.map((f) => (
              <SelectItem key={f} value={f}>
                {f.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced options (informational for now) */}
      <Accordion type="single" collapsible>
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced options</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <b>Fonts & layout:</b> Conversion fidelity depends on the
                original file and available fonts on this machine.
              </p>
              <p>
                <b>Images:</b> Embedded images are preserved. For web output
                (HTML), assets may be placed next to the HTML file.
              </p>
              <p>
                <b>Complex documents:</b> Very advanced features (macros, custom
                fields) may not fully translate.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
