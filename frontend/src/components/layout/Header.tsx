// Header.tsx
// Top navigation bar with branding and a link to the project repository.

// External libraries first
import { GithubIcon } from "lucide-react";

// Local UI primitives and constants
import { Button } from "@/components/ui/button";
import { APP_NAME, REPO_URL } from "@/lib/constants";

/**
 * Header
 * Sticky top navigation containing the site logo/name and a GitHub link.
 */
export function Header() {
  return (
    // Sticky header with subtle backdrop blur
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: brand (logo + text) */}
        <div className="flex items-center gap-x-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold">{APP_NAME}</span>
        </div>

        {/* Right: actions (external repository link) */}
        <div className="flex items-center gap-x-6">
          <Button variant="outline" size="sm" asChild>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-2 hover:border-rose-600/60"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
