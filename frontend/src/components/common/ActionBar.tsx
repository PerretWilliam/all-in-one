// src/components/common/ActionBar.tsx
// Small action bar that houses the Convert button and optional download link.

import { Button } from "@/components/ui/button";
import { DownloadIcon, PlayIcon } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

/**
 * Props for the ActionBar component.
 * - busy: whether a conversion is currently running
 * - canConvert: whether the Convert action should be enabled
 * - onConvert: callback invoked when the Convert button is clicked
 * - downloadUrl: optional URL of the converted file (shows Download link when present)
 * - downloadName: suggested filename for the downloaded file
 * - convertLabel / convertingLabel: optional labels for the convert button states
 */
type Props = {
  busy: boolean;
  canConvert: boolean;
  onConvert: () => void;
  downloadUrl?: string | null;
  downloadName?: string;
  convertLabel?: string;
  convertingLabel?: string;
};

/**
 * ActionBar
 * Renders a primary Convert button and, if an output URL is available,
 * a Download link. The Convert button switches its label when `busy` is true.
 */
export function ActionBar({
  busy,
  canConvert,
  onConvert,
  downloadUrl,
  downloadName = "output",
  convertLabel = "Convert",
  convertingLabel = "Converting…",
}: Props) {
  return (
    // Horizontal container that wraps on small screens
    <div className="flex items-center gap-3 flex-wrap">
      {/* Primary action: start conversion. Disabled if no file or when busy. */}
      <CustomButton
        onClick={onConvert}
        disabled={!canConvert || busy}
        size="lg"
      >
        <PlayIcon className="mr-2 h-4 w-4" />
        {/* Show converting label while busy, otherwise the normal label */}
        {busy ? convertingLabel : convertLabel}
      </CustomButton>

      {/* When a download URL exists, show a link styled as a button. */}
      {downloadUrl && (
        <Button asChild variant="link" size="lg">
          <a href={downloadUrl} download={downloadName}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      )}
    </div>
  );
}
