"use client";

import { motion } from "motion/react";
import { springBouncy } from "@/lib/motion";

export function Logo() {
  return (
    <motion.div
      className="flex select-none items-center gap-1"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
    >
      <motion.svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        whileHover={{ scale: 1.18, rotate: -8 }}
        transition={springBouncy}
        aria-hidden
      >
        <path
          d="M16 28C16 28 3 20.4 3 11.9A7.2 7.2 0 0 1 16 7.9 7.2 7.2 0 0 1 29 11.9C29 20.4 16 28 16 28Z"
          fill="var(--color-brand-pink)"
        />
      </motion.svg>
      <span className="font-display text-[22px] font-medium leading-none tracking-tight text-ink">
        HeartStamp
      </span>
    </motion.div>
  );
}
