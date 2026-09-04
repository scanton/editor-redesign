"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { toolLabel, toolsForStep } from "@/components/rail/tools";
import { STEPS, isGuided, stepTools } from "@/lib/steps";
import { springBouncy, springTight } from "@/lib/motion";
import { useWarnings } from "@/lib/warnings";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Two rails in one. In Create the tools are a palette — open what you like,
 * skip what you don't. In Personalize and Finish every section is a decision
 * that ends up on the order, so the rail numbers them, joins them with a track
 * and ticks them off behind you.
 *
 * Making the two look different is the point: nobody has to be told Create is
 * optional if it plainly isn't shaped like the steps that aren't.
 */
export function LeftRail() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const toggleTool = useEditorStore((s) => s.toggleTool);
  const step = useEditorStore((s) => s.step);
  const cardType = useEditorStore((s) => s.cardType);
  const product = useEditorStore((s) => s.product);
  const visited = useEditorStore((s) => s.visited);
  const warnings = useWarnings();

  const tools = toolsForStep(stepTools(step, cardType, product));
  const guided = isGuided(step);

  // The group is named for what you are doing, and Personalize says which
  // rendition you are dressing.
  const thing = product === "invitation" ? "invitation" : "card";
  const groupLabel =
    step === 2
      ? cardType === "digital"
        ? `Digital ${thing}`
        : `Printed ${thing}`
      : STEPS.find((s) => s.id === step)!.label;

  const doneCount = tools.filter((t) => visited.includes(t.id)).length;

  return (
    <nav
      aria-label="Editor tools"
      className="relative z-20 flex w-[var(--rail-width)] shrink-0 flex-col items-center gap-1 border-r border-hairline bg-surface pt-4"
    >
      <span className="w-full px-2 text-center text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
        {groupLabel}
      </span>
      <span className="mb-1 h-[14px] text-[10px] font-semibold tabular-nums text-ink-faint">
        {guided && `${doneCount} of ${tools.length}`}
      </span>

      <div className="relative flex flex-col items-center gap-1">
        {/* The track behind the numbers — what makes the rail read as a
            sequence rather than a set. */}
        {guided && tools.length > 1 && (
          <span
            aria-hidden
            className="absolute left-[13px] top-6 w-px bg-hairline-strong"
            style={{ bottom: 24 }}
          />
        )}

        {tools.map((tool, i) => {
          const isActive = activeTool === tool.id;
          const isDone = guided && visited.includes(tool.id) && !isActive;
          const flagged = warnings.some((w) => w.tool === tool.id);
          const Icon = tool.icon;

          return (
            <motion.button
              key={tool.id}
              type="button"
              aria-label={toolLabel(tool, product)}
              aria-pressed={isActive}
              aria-current={isActive && guided ? "step" : undefined}
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

              {guided && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[9.5px] font-bold tabular-nums transition-colors",
                    isDone
                      ? "border-brand-red bg-brand-red text-white"
                      : isActive
                        ? "border-brand-red bg-surface text-brand-red"
                        : "border-hairline-strong bg-surface text-ink-faint",
                  )}
                >
                  {isDone ? <Check size={11} strokeWidth={3.5} /> : i + 1}
                </span>
              )}

              {/* Real unfinished work, rather than an unvisited section. */}
              {flagged && (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-2.5 h-[7px] w-[7px] rounded-full bg-brand-red ring-2 ring-surface"
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
              <span className="relative leading-none">
                {toolLabel(tool, product)}
              </span>
            </motion.button>
          );
        })}
      </div>

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
