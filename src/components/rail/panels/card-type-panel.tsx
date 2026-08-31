"use client";

import { motion } from "motion/react";
import { Check, Printer, Sparkles } from "lucide-react";
import { PanelBody, Section } from "@/components/rail/panels/parts";
import { springBouncy, staggerParent } from "@/lib/motion";
import { CARD_TYPES } from "@/lib/pricing";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const ICONS = { digital: Sparkles, printed: Printer };

/**
 * A card is both renditions at once. This picks which one you're editing —
 * it never throws the other away, which is the whole reason it can sit here
 * rather than at checkout.
 */
export function CardTypePanel() {
  const cardType = useEditorStore((s) => s.cardType);
  const setCardType = useEditorStore((s) => s.setCardType);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section title="Rendition">
          <div className="flex flex-col gap-2.5">
            {CARD_TYPES.map((type) => {
              const on = cardType === type.id;
              const Icon = ICONS[type.id];
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => setCardType(type.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springBouncy}
                  className={cn(
                    "rounded-[14px] border-2 p-3.5 text-left transition-colors",
                    on
                      ? "border-brand-red bg-brand-red/5"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      size={16}
                      className={on ? "text-brand-red" : "text-ink-soft"}
                    />
                    <span className="text-[14.5px] font-semibold text-ink">
                      {type.label}
                    </span>
                    <span className="ml-auto text-[13px] font-medium text-ink-soft tabular-nums">
                      {type.price}
                    </span>
                    {on && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 block text-[12.5px] leading-snug text-ink-faint">
                    {type.note}
                  </span>
                  <span
                    className={cn(
                      "mt-2 block text-[11px] font-semibold uppercase tracking-[0.06em]",
                      on ? "text-brand-red" : "text-ink-faint",
                    )}
                  >
                    {on ? "Editing this one" : "Saved, not open"}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        <Section>
          <p className="rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            Both renditions stay saved at all times. Switching never loses work on
            the other one, and both can go in the same order.
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
