"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PanelBody, Section } from "@/components/rail/panels/parts";
import { springBouncy, staggerParent } from "@/lib/motion";
import { INVITATION_PPI, TRIMS, invitationSize } from "@/lib/invitation";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * How the printed invitation is cut. A greeting card runs one trim, so this
 * panel only exists on the printed invitation.
 *
 * The choice is a die rather than a render: the artwork bleeds past the trim
 * line either way and the corners come off afterwards, which is why picking
 * one never leaves the invitation waiting on the model.
 */
export function TrimPanel() {
  const trim = useEditorStore((s) => s.invitation.trim);
  const setTrim = useEditorStore((s) => s.setTrim);
  const orientation = useEditorStore((s) => s.invitation.orientation);
  const size = invitationSize(orientation);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section title="Corners">
          <div className="flex flex-col gap-2.5">
            {TRIMS.map((option) => {
              const on = trim === option.id;
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => setTrim(option.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springBouncy}
                  className={cn(
                    "flex items-start gap-3 rounded-[14px] border-2 p-3.5 text-left transition-colors",
                    on
                      ? "border-brand-red bg-brand-red/5"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  {/* The sample is the actual trim, at the actual ratio. */}
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 border-2 border-ink/70 bg-surface-sunken"
                    style={{
                      width: 30,
                      height: (30 * size.height) / size.width,
                      borderRadius: option.radiusIn * INVITATION_PPI * (30 / size.width),
                    }}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-ink">
                        {option.label}
                      </span>
                      {option.radiusIn > 0 && (
                        <span className="text-[12.5px] text-ink-soft tabular-nums">
                          {fraction(option.radiusIn)}&quot; radius
                        </span>
                      )}
                      {on && (
                        <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block text-[12.5px] leading-snug text-ink-faint">
                      {option.note}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        <Section>
          <p className="rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            The artwork runs past the trim line whichever you pick, so the
            corners are cut after printing — switching costs you nothing and
            never needs a new render. Digital invitations have no trim.
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}

/** Print sizes are spoken in fractions, not decimals. */
function fraction(inches: number) {
  const eighths = Math.round(inches * 8);
  if (eighths % 8 === 0) return String(eighths / 8);
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const d = gcd(eighths, 8);
  return `${eighths / d}/${8 / d}`;
}
