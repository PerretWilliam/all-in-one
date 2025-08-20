// Logo.tsx
// Small branded logo component used across the app.

/**
 * Props for the Logo component.
 * - size: visual size of the logo image (sm, md, lg)
 * - withText: whether to render the app name next to the logo
 */
type LogoProps = {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
};

/**
 * Logo
 * Renders a small image and, optionally, the application name.
 * The text label uses a gradient clip for a polished visual.
 */
export function Logo({ size = "md", withText = true }: LogoProps) {
  // Map the size prop to tailwind width/height classes
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className="flex items-center gap-x-2">
      {/* Decorative logo image; alt text kept short */}
      <img src="/logo.png" alt="Logo" className={sizes[size]} />

      {/* Optional textual brand. The label is standard English. */}
      {withText && (
        <span className="font-semibold tracking-tight bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
          Online Converter
        </span>
      )}
    </div>
  );
}
