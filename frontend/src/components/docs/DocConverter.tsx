// src/components/docs/DocConverter.tsx
// Document converter UI: drag & drop a file, choose target format, convert and download.

import { useState } from "react";

// Hooks (types first)
import { useDocConvert } from "@/hooks/useDocConvert";
import type { DocFormat } from "@/hooks/useDocConvert";

// Shared UI components
import { DropArea } from "@/components/common/DropArea";
import { ActionBar } from "@/components/common/ActionBar";

// Local controls
import { DocControls } from "./DocControls";

export default function DocConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<DocFormat>("pdf");
  const [outName, setOutName] = useState("document");

  const { busy, outUrl, setOutUrl, convert } = useDocConvert();

  async function onConvert() {
    if (!file) return;
    await convert(file, format);
  }

  return (
    <div className="space-y-6">
      <DropArea
        accept={{
          // Common office & text formats. You can loosen to "*/*" if you prefer.
          "application/pdf": [],
          "application/msword": [],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [],
          "application/vnd.oasis.opendocument.text": [],
          "application/rtf": [],
          "text/plain": [],
          "text/html": [],
          "application/vnd.ms-powerpoint": [],
          "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            [],
          "application/vnd.ms-excel": [],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            [],
        }}
        onFile={(f) => {
          setFile(f);
          setOutUrl(null);
          setOutName(f.name.replace(/\.[^.]+$/, "") || "document");
        }}
        labelIdle="Drop a document or click to select"
        labelActive="Drop it here…"
        selected={file}
      />

      <DocControls format={format} setFormat={setFormat} disabled={busy} />

      <ActionBar
        busy={busy}
        canConvert={!!file}
        onConvert={onConvert}
        downloadUrl={outUrl || undefined}
        downloadName={`${outName}.${format}`}
        convertLabel="Convert"
        convertingLabel="Converting..."
      />

      <p className="text-sm text-gray-500">
        Some conversions like PDF → Word, TXT and ODT aren't supported.
      </p>
    </div>
  );
}
