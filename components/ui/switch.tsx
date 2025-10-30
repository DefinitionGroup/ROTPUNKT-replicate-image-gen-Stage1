"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border border-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/60",
        checked ? "bg-brand-primary-2" : "bg-gray-800",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "block h-4 w-4 rounded-full bg-white shadow",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

export default Switch;
