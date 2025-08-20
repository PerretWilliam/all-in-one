import React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "default" | "lg" | "icon";
type Variant = "default" | "outline" | "ghost" | "link";

type CustomButtonProps = React.PropsWithChildren<{
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  size?: Size;
  variant?: Variant;
  href?: string;
  download?: string | boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}> &
  Omit<React.HTMLAttributes<HTMLButtonElement>, "onClick">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantStyles: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md hover:from-rose-600 hover:to-orange-600",
  outline: "bg-white border border-gray-200 text-rose-600 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  link: "bg-transparent text-rose-600 underline-offset-4 hover:underline",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  default: "h-10 px-4",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export const CustomButton = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  CustomButtonProps
>(
  (
    {
      children,
      onClick,
      disabled = false,
      size = "default",
      variant = "default",
      href,
      download,
      className,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const classes = cn(
      base,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    // Render as anchor when href provided (supports download link)
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          download={
            download === true ? undefined : (download as string) || undefined
          }
          aria-disabled={disabled}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            if (onClick) onClick(e as React.MouseEvent<HTMLAnchorElement>);
          }}
          className={cn(classes, disabled && "pointer-events-none opacity-50")}
          {...(rest as React.HTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        disabled={disabled}
        className={classes}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
