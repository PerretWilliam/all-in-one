// Sidebar.tsx
// Navigation sidebar listing available converters grouped by category.

// External imports
import type { JSX } from "react";

// Local components
import { CustomButton } from "@/components/ui/sidebar-button";

/**
 * Props for the Sidebar component.
 * - selected: currently selected converter key
 * - setSelected: callback to change the selected converter
 * - converters: list of available converters (key, label, icon)
 */
type SidebarProps = {
  selected: string;
  setSelected: (key: string) => void;
  converters: { key: string; label: string; icon: JSX.Element }[];
};

/**
 * Sidebar
 * Renders grouped converter buttons and a small privacy notice. The
 * converters prop is expected to contain entries for all possible keys;
 * grouping is performed locally via the `categories` map.
 */
export function Sidebar({ selected, setSelected, converters }: SidebarProps) {
  // Local grouping of converter keys into sections. Adjust the arrays to
  // change which converters appear in each group.
  const categories = {
    media: ["image", "audio", "video", "docs"],
    youtube: ["ytdlAudio", "ytdlVideo"],
  };

  return (
    // Fixed-width aside column
    <aside className="w-64 border-r bg-gray-50">
      <div className="flex h-full flex-col py-6">
        <div className="px-4 mb-6">
          <h2 className="font-medium text-sm text-gray-500">CONVERTERS</h2>
        </div>

        <nav className="flex-1 px-2">
          <div className="space-y-6">
            {/* Media Section */}
            <div>
              <div className="px-3 mb-2">
                <h3 className="text-xs font-medium text-gray-400">MEDIA</h3>
              </div>
              <div className="space-y-1">
                {converters
                  .filter((c) => categories.media.includes(c.key))
                  .map((c) => (
                    <CustomButton
                      key={c.key}
                      keyProp={c.key}
                      onClick={() => setSelected(c.key)}
                      selected={selected === c.key}
                      icon={c.icon}
                      label={c.label}
                    />
                  ))}
              </div>
            </div>

            {/* YouTube Section */}
            <div>
              <div className="px-3 mb-2">
                <h3 className="text-xs font-medium text-gray-400">YOUTUBE</h3>
              </div>
              <div className="space-y-1">
                {converters
                  .filter((c) => categories.youtube.includes(c.key))
                  .map((c) => (
                    <CustomButton
                      key={c.key}
                      keyProp={c.key}
                      onClick={() => setSelected(c.key)}
                      selected={selected === c.key}
                      icon={c.icon}
                      label={c.label}
                    />
                  ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Privacy / local processing note */}
        <div className="px-4 pt-6 mt-auto">
          <p className="text-xs text-gray-500">
            All processing is done locally.
            <br />
            Your files never leave your device.
          </p>
        </div>
      </div>
    </aside>
  );
}
