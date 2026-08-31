"use client";

import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { PanelBody, Section } from "@/components/rail/panels/parts";
import { PRINT_SPEC } from "@/lib/fulfilment";
import { staggerParent } from "@/lib/motion";
import { findEnvelopeLook } from "@/lib/digital-card";
import { useEditorStore } from "@/store/editor-store";

/**
 * How many copies, and what every copy is. We run one stock and square corners,
 * so the rest of this panel states the specification rather than offering it.
 */
export function PrintOptionsPanel() {
  const quantity = useEditorStore((s) => s.fulfilment.quantity);
  const setFulfilment = useEditorStore((s) => s.setFulfilment);
  const envelope = useEditorStore((s) => s.envelope);
  const look = useEditorStore((s) => findEnvelopeLook(s.digital.envelopeLook));

  const spec: [string, string][] = [
    ["Stock", PRINT_SPEC.stock],
    ["Corners", PRINT_SPEC.corners],
    [
      "Mailer",
      `${envelope.flap === "euro" ? "Euro flap" : "Square flap"} · ${
        look?.label ?? "natural"
      } liner`,
    ],
    ["Region", PRINT_SPEC.region],
  ];

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section title="Copies">
          <div className="flex items-center justify-between rounded-[12px] border border-hairline px-3.5 py-2.5">
            <span className="text-[13.5px] text-ink-soft">How many to print</span>
            <span className="flex items-center gap-1">
              <motion.button
                type="button"
                aria-label="One fewer copy"
                onClick={() =>
                  setFulfilment({ quantity: Math.max(1, quantity - 1) })
                }
                disabled={quantity <= 1}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-opacity hover:bg-surface-sunken disabled:opacity-30"
              >
                <Minus size={14} />
              </motion.button>
              <span className="min-w-[26px] text-center text-[14px] font-semibold tabular-nums text-ink">
                {quantity}
              </span>
              <motion.button
                type="button"
                aria-label="One more copy"
                onClick={() => setFulfilment({ quantity: quantity + 1 })}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink hover:bg-surface-sunken"
              >
                <Plus size={14} />
              </motion.button>
            </span>
          </div>
        </Section>

        <Section title="Every copy">
          <dl className="overflow-hidden rounded-[12px] border border-hairline">
            {spec.map(([key, value], i) => (
              <div
                key={key}
                className={
                  "flex items-baseline justify-between gap-4 px-3.5 py-2.5" +
                  (i > 0 ? " border-t border-hairline" : "")
                }
              >
                <dt className="shrink-0 text-[13px] text-ink-faint">{key}</dt>
                <dd className="text-right text-[13px] font-medium text-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2.5 text-[12px] leading-snug text-ink-faint">
            One stock, square corners. Changing either is a production change,
            not a customer choice.
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
