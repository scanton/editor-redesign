"use client";

import { motion } from "motion/react";
import { AlertTriangle, Check } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { springBouncy, springTight } from "@/lib/motion";
import { STEPS } from "@/lib/steps";
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
  const warnings = useWarnings();

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const current = s.id === step;
        const done = s.id < step;
        return (
          <div key={s.id} className="flex items-center gap-1">
            {i > 0 && <span className="h-px w-5 bg-hairline-strong" />}
            <Tooltip label={s.note} side="bottom">
              <motion.button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => setStep(s.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springTight}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors",
                  current ? "text-ink" : "text-ink-faint hover:text-ink-soft",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold tabular-nums",
                    done
                      ? "border-brand-red bg-brand-red text-white"
                      : current
                        ? "border-ink text-ink"
                        : "border-hairline-strong text-ink-faint",
                  )}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : s.id}
                </span>
                <span className="text-[13.5px] font-semibold">{s.label}</span>
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
