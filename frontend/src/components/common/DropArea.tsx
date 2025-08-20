// src/components/common/DropArea.tsx
// Drop area component for file selection via drag & drop or click.

// External dependencies first
import { useDropzone } from "react-dropzone";
import { UploadCloudIcon } from "lucide-react";

// Local utilities after
import { cn } from "@/lib/utils";

/**
 * Props for the DropArea component.
 * - accept: mime/type map passed to react-dropzone
 * - onFile: callback invoked with the picked File
 * - labelIdle: text shown when not dragging
 * - labelActive: text shown while dragging a file over the area
 * - selected: optional currently selected File
 */
type Props = {
  accept: Record<string, string[]>;
  onFile: (f: File) => void;
  labelIdle: string;
  labelActive: string;
  selected?: File | null;
};

export function DropArea({
  accept,
  onFile,
  labelIdle,
  labelActive,
  selected,
}: Props) {
  // Initialize the dropzone. We only accept a single file and forward the
  // first dropped file to the parent via onFile.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept,
    onDrop: (files) => files[0] && onFile(files[0]),
  });

  return (
    // The root container handles click and drag events provided by react-dropzone
    <div
      {...getRootProps()}
      className={cn(
        "group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition bg-white hover:border-rose-600/60",
        // Apply a highlighted style while the user is dragging a file over the area
        isDragActive ? "border-rose-600/60 bg-primary/5" : "border-muted"
      )}
    >
      {/* Hidden file input wired to react-dropzone */}
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-2">
        {/* Upload icon */}
        <UploadCloudIcon className="h-6 w-6 text-muted-foreground" />

        {/* Informational label changes based on drag state */}
        <p className="text-sm text-muted-foreground">
          {isDragActive ? labelActive : labelIdle}
        </p>

        {/* When a file is selected, show its name. Label is in English. */}
        {selected && (
          <p className="text-xs text-foreground mt-1">
            File: <strong>{selected.name}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
