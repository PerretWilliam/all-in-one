// src/components/common/DropArea.tsx
// DropArea
// Developer notes:
// - Lightweight presentational component that abstracts `react-dropzone` usage.
// - Holds no internal file persistence beyond the Files array passed to `onFiles`.
// - Keeps markup minimal so it can be reused across converters (audio/image/video/docs).

// External libraries
import { useDropzone } from "react-dropzone";
import { UploadCloudIcon } from "lucide-react";

// Local utilities
import { cn } from "@/lib/utils";

/**
 * Props for DropArea (developer-facing):
 * - accept: react-dropzone accept map (e.g. { 'audio/*': [] })
 * - onFiles: callback invoked with an array of picked File objects
 * - labelIdle: message shown when no drag is active
 * - labelActive: message shown while user is dragging files over the area
 * - selected: optional array of currently selected File objects for UI preview
 * - multiple: allow selecting/dropping multiple files (defaults to true)
 */
type Props = {
  accept: Record<string, string[]>;
  onFiles: (f: File[]) => void;
  labelIdle: string;
  labelActive: string;
  selected?: File[] | null;
  multiple?: boolean;
};

export function DropArea({
  accept,
  onFiles,
  labelIdle,
  labelActive,
  selected,
  multiple = true,
}: Props) {
  // Initialize react-dropzone. Keep configuration minimal: pass-through of
  // `multiple` and `accept`, and forward dropped files to parent via `onFiles`.
  // Note: we intentionally forward the whole File[] so parent hooks can implement
  // batching, naming, or validation logic.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    accept,
    onDrop: (files) => files.length && onFiles(files),
  });

  return (
    // Root container: receives drag/click events from react-dropzone via spread props
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

        {/* Show a short list of selected files */}
        {selected?.length ? (
          // Keep the preview compact: show at most 3 filenames and a count for the rest.
          <div className="text-xs text-foreground mt-1 space-y-0.5 max-w-[28rem]">
            {selected.slice(0, 3).map((f) => (
              <div key={f.name} className="truncate">
                • <strong>{f.name}</strong>
              </div>
            ))}
            {selected.length > 3 && <div>+{selected.length - 3} more…</div>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
