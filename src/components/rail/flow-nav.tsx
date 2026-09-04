"use client";

import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TOOLS, toolLabel } from "@/components/rail/tools";
import { STEPS, flowPosition, isGuided } from "@/lib/steps";
import { springBouncy, springTight } from "@/lib/motion";
import type { ToolId } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";

/**
 * Back and Next along the guided steps. Create has none of this on purpose —
 * it is a palette, and the absence of these buttons is how you can tell.
 *
 * Nothing here is gated. Every section already carries a sensible default, so
 * refusing to advance would be inventing work; what matters is that the whole
 * sequence is walked, not that something is changed in each one. Sections with
 * real unfinished work are flagged on the rail instead.
 */
export function FlowNav() {
  const step = useEditorStore((s) => s.step);
  const tool = useEditorStore((s) => s.activeTool);
  const cardType = useEditorStore((s) => s.cardType);
  const product = useEditorStore((s) => s.product);
  const goTo = useEditorStore((s) => s.goTo);

  if (!isGuided(step) || !tool) return null;
  const position = flowPosition(tool, cardType, product);
  if (!position) return null;

  const { index, total, prev, next } = position;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...springBouncy, delay: 0.06 }}
      className="shrink-0 border-t border-hairline bg-surface px-4 py-3"
    >
      <div className="mb-2 flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-full transition-colors"
            style={{
              background:
                i === index
                  ? "var(--color-brand-red)"
                  : i < index
                    ? "color-mix(in srgb, var(--color-brand-red) 32%, transparent)"
                    : "var(--color-hairline-strong)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <motion.button
          type="button"
          onClick={() =>
            prev ? goTo(prev.step, prev.tool) : goTo(1, null)
          }
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={springTight}
          className="flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-semibold text-ink-soft hover:bg-surface-sunken hover:text-ink"
        >
          <ArrowLeft size={15} className="shrink-0" />
          <span className="truncate">
            {prev ? nameOf(prev.tool, product) : "Create"}
          </span>
        </motion.button>

        {next ? (
          <motion.button
            type="button"
            onClick={() => goTo(next.step, next.tool)}
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.96 }}
            transition={springBouncy}
            className="flex min-w-0 items-center gap-1.5 rounded-full bg-brand-red px-3.5 py-2 text-[13px] font-semibold text-white shadow-rail"
          >
            <span className="truncate">
              {/* Crossing into the next step is worth saying out loud. */}
              {next.step !== step
                ? STEPS.find((s) => s.id === next.step)!.label
                : nameOf(next.tool, product)}
            </span>
            <ArrowRight size={15} className="shrink-0" />
          </motion.button>
        ) : (
          <span className="px-2 text-[12px] text-ink-faint">
            Everything decided
          </span>
        )}
      </div>
    </motion.div>
  );
}

function nameOf(id: ToolId, product: "card" | "invitation") {
  const tool = TOOLS.find((t) => t.id === id);
  return tool ? toolLabel(tool, product) : id;
}
