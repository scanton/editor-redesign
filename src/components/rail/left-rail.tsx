"use client";

import { motion } from "motion/react";
import { toolsForStep } from "@/components/rail/tools";
import { STEPS, stepTools } from "@/lib/steps";
import { springBouncy, springTight } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

export function LeftRail() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const toggleTool = useEditorStore((s) => s.toggleTool);
  const step = useEditorStore((s) => s.step);
  const cardType = useEditorStore((s) => s.cardType);

  const tools = toolsForStep(stepTools(step, cardType));
  // The group is named for what you are doing, and Personalize says which
  // rendition you are dressing.
  const groupLabel =
    step === 2
      ? cardType === "digital"
        ? "Digital card"
        : "Printed card"
      : STEPS.find((s) => s.id === step)!.label;

  return (
    <nav
      aria-label="Editor tools"
      className="relative z-20 flex w-[var(--rail-width)] shrink-0 flex-col items-center gap-1 border-r border-hairline bg-surface pt-4"
    >
      <span className="mb-1 w-full px-2 text-center text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
        {groupLabel}
      </span>

      {tools.map((tool, i) => {
        const isActive = activeTool === tool.id;
        const Icon = tool.icon;
        return (
          <motion.button
            key={tool.id}
            type="button"
            aria-label={tool.label}
            aria-pressed={isActive}
            onClick={() => toggleTool(tool.id)}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springBouncy, delay: 0.04 * i }}
            whileHover="hover"
            whileTap={{ scale: 0.93 }}
            className={cn(
              "group relative flex w-[68px] flex-col items-center gap-1.5 rounded-[16px] px-1 py-3 text-[11px] font-semibold transition-colors",
              isActive ? "text-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="rail-active-pill"
                transition={springBouncy}
                className="absolute inset-0 rounded-[16px] bg-surface-sunken"
              />
            )}
            <motion.span
              className="relative"
              variants={{ hover: { y: -2, rotate: -6, scale: 1.12 } }}
              animate={isActive ? { scale: 1.06 } : { scale: 1 }}
              transition={springTight}
            >
              <Icon size={22} strokeWidth={1.8} />
            </motion.span>
            <span className="relative leading-none">{tool.label}</span>
          </motion.button>
        );
      })}

      <div className="mt-auto pb-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.92 }}
          transition={springBouncy}
          aria-label="Account"
          className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-brand-pink to-brand-red shadow-rail"
        />
      </div>
    </nav>
  );
}
