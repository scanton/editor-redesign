"use client";

import { motion } from "motion/react";
import { AlertTriangle, Check } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { springBouncy, springTight } from "@/lib/motion";
import { STEPS, isGuided, stepTools } from "@/lib/steps";
import { useWarnings } from "@/lib/warnings";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Create → Personalize → Finish. Steps are freely navigable — the numbering
 * says what order the job usually goes in, not what you are allowed to do.
 */
export function Stepper() {
  const step = useEditorStore((s) => s.step);
  const setStep = useEditorStore((s) => s.setStep);
  const cardType = useEditorStore((s) => s.cardType);
  const product = useEditorStore((s) => s.product);
  const visited = useEditorStore((s) => s.visited);
  const warnings = useWarnings();

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const current = s.id === step;
        const done = s.id < step;
        // Guided steps have sections to get through; Create does not, so it
        // never wears a progress ring.
        const sections = isGuided(s.id) ? stepTools(s.id, cardType, product) : [];
        const passed = sections.filter((t) => visited.includes(t)).length;
        return (
          <div key={s.id} className="flex items-center gap-1">
            {i > 0 && <span className="h-px w-4 bg-hairline-strong" />}
            <Tooltip label={s.note} side="bottom">
              <motion.button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => setStep(s.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springTight}
                className={cn(
                  "flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-2.5 transition-colors",
                  current ? "text-ink" : "text-ink-faint hover:text-ink-soft",
                )}
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border text-[11.5px] font-semibold tabular-nums",
                      done
                        ? "border-brand-red bg-brand-red text-white"
                        : current
                          ? "border-ink text-ink"
                          : "border-hairline-strong text-ink-faint",
                      // The ring draws the edge, so the border steps aside.
                      !done && sections.length > 0 && "border-transparent",
                    )}
                  >
                    {done ? <Check size={12} strokeWidth={3} /> : s.id}
                  </span>

                  {!done && sections.length > 0 && (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute inset-0 -rotate-90"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="11"
                        fill="none"
                        strokeWidth="2"
                        className="stroke-hairline-strong"
                      />
                      <motion.circle
                        cx="12"
                        cy="12"
                        r="11"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={current ? "stroke-ink" : "stroke-brand-red"}
                        style={{ pathLength: passed / sections.length }}
                        initial={false}
                        animate={{ pathLength: passed / sections.length }}
                        transition={springBouncy}
                      />
                    </svg>
                  )}
                </span>
                {/* Two products, three steps and the view controls all want
                    the same bar. Below a wide viewport only the step you are
                    standing in keeps its name; the numbers carry the rest. */}
                <span
                  className={cn(
                    "text-[13.5px] font-semibold",
                    current ? "inline" : "hidden 2xl:inline",
                  )}
                >
                  {s.label}
                </span>
              </motion.button>
            </Tooltip>
          </div>
        );
      })}

      {warnings.length > 0 && (
        <Tooltip
          label={
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">Unfinished work</span>
              {warnings.map((w) => (
                <span key={w.id} className="opacity-75">
                  {w.label}
                </span>
              ))}
            </span>
          }
          side="bottom"
        >
          <motion.button
            type="button"
            aria-label={`${warnings.length} thing${warnings.length === 1 ? "" : "s"} unfinished`}
            onClick={warnings[0].go}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={springBouncy}
            className="ml-2 flex items-center gap-1.5 rounded-full border border-brand-red/45 px-2.5 py-1 text-[12px] font-semibold text-ink"
          >
            <AlertTriangle size={13} className="text-brand-red" />
            <span className="tabular-nums">{warnings.length}</span>
          </motion.button>
        </Tooltip>
      )}
    </div>
  );
}
