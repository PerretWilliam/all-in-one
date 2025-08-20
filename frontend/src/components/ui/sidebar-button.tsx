import React from "react";
import { cn } from "@/lib/utils";

type CustomButtonProps = {
  keyProp: string;
  onClick: () => void;
  selected: boolean;
  icon?: React.ReactNode;
  label: React.ReactNode;
};

export const CustomButton: React.FC<CustomButtonProps> = ({
  keyProp,
  onClick,
  selected,
  icon,
  label,
}) => (
  <button
    key={keyProp}
    onClick={onClick}
    className={cn(
      "group flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
      selected
        ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
        : "text-gray-700 hover:bg-white/50 hover:text-rose-600"
    )}
  >
    {icon}
    {label}
  </button>
);
