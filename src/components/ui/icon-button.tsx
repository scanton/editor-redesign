"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { springTight } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Variant = "ghost" | "solid" | "soft";

const variants: Record<Variant, string> = {
  ghost: "text-ink-soft hover:text-ink hover:bg-surface-sunken",
  soft: "bg-surface-sunken text-ink hover:bg-hairline",
  solid: "bg-brand-red text-white hover:bg-brand-red-hover shadow-rail",
};

type Props = Omit<ComponentProps<typeof motion.button>, "children"> & {
  variant?: Variant;
  children: ReactNode;
};

export function IconButton({
  variant = "ghost",
  className,
  children,
  ...props
}: Props) {
  return (
    <motion.button
      type="button"
      whileHover={props.disabled ? undefined : { scale: 1.08 }}
      whileTap={props.disabled ? undefined : { scale: 0.9 }}
      transition={springTight}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-35",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
