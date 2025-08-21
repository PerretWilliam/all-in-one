// Footer.tsx
// Site footer containing links to tools, legal pages and social profiles.

// External imports first (bring React into scope for event typing)
import { APP_NAME } from "@/lib/constants";
import React from "react";

type FooterProps = {
  onNavigate?: (key: string) => void;
};

/**
 * Footer
 * Displays grouped links and a small copyright line. If an `onNavigate`
 * handler is provided, internal legal links will call it instead of
 * performing a normal navigation (useful for single-page app routing).
 */
export function Footer({ onNavigate }: FooterProps) {
  const links = {
    tools: [
      { label: "FFmpeg", href: "https://ffmpeg.org" },
      { label: "yt-dlp", href: "https://github.com/yt-dlp/yt-dlp" },
      { label: "Squoosh", href: "https://squoosh.app" },
      { label: "LibreOffice", href: "https://www.libreoffice.org" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy", key: "privacy" },
      { label: "Terms", href: "/terms", key: "terms" },
    ],
    social: [
      {
        label: "GitHub",
        href: "https://github.com/PerretWilliam/",
      },
      { label: "Website", href: "https://william-perret.fr" },
    ],
  };

  const handleLegalClick =
    (key?: string, href?: string) => (e: React.MouseEvent) => {
      // If a navigation key is provided and a handler exists, prevent the
      // browser navigation and call the handler. This lets the parent decide
      // how to show legal pages (e.g. open a modal or client-side route).
      if (key && onNavigate) {
        e.preventDefault();
        onNavigate(key);
        return;
      }

      // Otherwise fall back to normal anchor behavior. If href is present
      // the browser will navigate to it; nothing to do here.
      if (href) {
        return;
      }
    };

  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Tools Used
            </h3>
            <ul className="space-y-3">
              {links.tools.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={handleLegalClick(link.key, link.href)}
                    className="text-sm text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Social</h3>
            <ul className="space-y-3">
              {links.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} {APP_NAME}. Made with ❤️ by
            William Perret
          </p>
        </div>
      </div>
    </footer>
  );
}
