"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Side = "right" | "left" | "bottom" | "top";

const sideClasses: Record<Side, string> = {
  right: "left-full top-1/2 -translate-y-1/2 ml-3",
  left: "right-full top-1/2 -translate-y-1/2 mr-3",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
};

const sideOffset: Record<Side, { x?: number; y?: number }> = {
  right: { x: -6 },
  left: { x: 6 },
  bottom: { y: -6 },
  top: { y: 6 },
};

export function Tooltip({
  label,
  side = "right",
  children,
  className,
  disabled,
}: {
  label: ReactNode;
  side?: Side;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && !disabled && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, ...sideOffset[side] }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            transition={springBouncy}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-[10px] bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-pop",
              sideClasses[side],
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
