"use client";

import { motion } from "motion/react";
import { CalendarHeart, Heart } from "lucide-react";
import { springBouncy, springTight } from "@/lib/motion";
import type { Product } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const PRODUCTS: { id: Product; label: string; icon: typeof Heart }[] = [
  { id: "card", label: "Cards", icon: Heart },
  { id: "invitation", label: "Invitations", icon: CalendarHeart },
];

/**
 * Two product lines in one editor. Each keeps its own document and history, so
 * this is a switch between two pieces of work rather than a mode that discards
 * the other — which is what lets it sit in the chrome instead of behind a
 * confirmation.
 */
export function ProductSwitch() {
  const product = useEditorStore((s) => s.product);
  const setProduct = useEditorStore((s) => s.setProduct);

  return (
    <div
      role="tablist"
      aria-label="Product"
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-surface-sunken p-1"
    >
      {PRODUCTS.map(({ id, label, icon: Icon }) => {
        const on = product === id;
        return (
          <motion.button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setProduct(id)}
            whileHover={{ scale: on ? 1 : 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={springTight}
            className="relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5"
          >
            {on && (
              <motion.span
                layoutId="product-pill"
                transition={springBouncy}
                className="absolute inset-0 rounded-full bg-surface shadow-sm"
              />
            )}
            <Icon
              size={14}
              className={cn(
                "relative transition-colors",
                on ? "text-brand-red" : "text-ink-faint",
              )}
            />
            <span
              className={cn(
                "relative text-[12.5px] font-semibold transition-colors",
                on ? "text-ink" : "text-ink-faint",
              )}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
