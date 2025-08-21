// src/components/docs/DocConverter.tsx
// Document converter UI: drag & drop files, pick target format, convert in batch and download.

import { useState } from "react"; // React hook for local state

// Shared types
import type { DocFormat } from "@/lib/types";

// Hooks
import { useDocConvertBatch } from "@/hooks/useDocConvertBatch";

// Shared UI components
import { DropArea } from "@/components/common/DropArea";
import { ActionBar } from "@/components/common/ActionBar";

// Local controls
import { DocControls } from "./DocControls";

export default function DocConverter() {
  // Local state: list of selected files and target document format
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<DocFormat>("pdf");

  // Custom hook providing conversion status, resulting ZIP URL and trigger function
  const { busy, zipUrl, convert } = useDocConvertBatch();

  return (
    <div className="space-y-6">
      {/* DropArea: file drag & drop or click-to-select.
          'accept' restricts selectable MIME types for common office/text formats.
          onFiles receives an array of File objects and we store them in local state. */}
      <DropArea
        accept={{
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
        onFiles={setFiles}
        labelIdle="Drag and drop documents or click to select"
        labelActive="Drop documents here…"
        selected={files}
      />

      {/* Controls for selecting target format. Disabled while conversion is running. */}
      <DocControls format={format} setFormat={setFormat} disabled={busy} />

      {/* ActionBar: handles conversion action and download of resulting ZIP.
          - canConvert enables the convert button only when files are present.
          - onConvert triggers the convert hook with current files and selected format.
          - downloadUrl is populated by the conversion hook when ready. */}
      <ActionBar
        busy={busy}
        canConvert={files.length > 0}
        onConvert={() => convert(files, format)}
        downloadUrl={zipUrl}
        downloadName={`converted-documents.zip`}
        convertLabel={files.length > 1 ? "Convert all" : "Convert"}
        convertingLabel="Converting..."
      />

      {/* Informational note for users about unsupported conversions. */}
      <p className="text-sm text-gray-500">
        Some conversions like PDF → Word, TXT and ODT aren't supported.
      </p>
    </div>
  );
}
