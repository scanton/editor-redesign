"use client";

import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { PanelBody, Section } from "@/components/rail/panels/parts";
import { springTight, staggerParent } from "@/lib/motion";
import { CORNERS, STOCKS } from "@/lib/fulfilment";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/** Stock, corners and how many copies get printed. */
export function PrintOptionsPanel() {
  const fulfilment = useEditorStore((s) => s.fulfilment);
  const setFulfilment = useEditorStore((s) => s.setFulfilment);
  const envelope = useEditorStore((s) => s.envelope);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section title="Stock">
          <div className="flex flex-col gap-2">
            {STOCKS.map((stock) => {
              const on = fulfilment.stock === stock.id;
              return (
                <motion.button
                  key={stock.id}
                  type="button"
                  onClick={() => setFulfilment({ stock: stock.id })}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  transition={springTight}
                  className={cn(
                    "flex items-baseline gap-2 rounded-[12px] border-2 px-3.5 py-2.5 text-left transition-colors",
                    on
                      ? "border-brand-red bg-brand-red/5"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  <span className="text-[13.5px] font-semibold text-ink">
                    {stock.label}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    {stock.detail}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        <Section title="Corners">
          <div className="flex gap-2">
            {CORNERS.map((corner) => {
              const on = fulfilment.corners === corner.id;
              return (
                <motion.button
                  key={corner.id}
                  type="button"
                  onClick={() => setFulfilment({ corners: corner.id })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springTight}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-[12px] border-2 py-3 transition-colors",
                    on
                      ? "border-brand-red bg-brand-red/5"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  <span
                    className={cn(
                      "block h-7 w-9 border-2 border-ink-soft",
                      corner.id === "rounded" ? "rounded-[7px]" : "rounded-[1px]",
                    )}
                  />
                  <span className="text-[12.5px] font-medium text-ink">
                    {corner.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        <Section title="Copies">
          <div className="flex items-center justify-between rounded-[12px] border border-hairline px-3 py-2">
            <span className="text-[13px] text-ink-soft">How many to print</span>
            <span className="flex items-center gap-1">
              <motion.button
                type="button"
                aria-label="One fewer copy"
                onClick={() =>
                  setFulfilment({ quantity: Math.max(1, fulfilment.quantity - 1) })
                }
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink hover:bg-surface-sunken disabled:opacity-30"
                disabled={fulfilment.quantity <= 1}
              >
                <Minus size={14} />
              </motion.button>
              <span className="min-w-[26px] text-center text-[13.5px] font-semibold tabular-nums text-ink">
                {fulfilment.quantity}
              </span>
              <motion.button
                type="button"
                aria-label="One more copy"
                onClick={() =>
                  setFulfilment({ quantity: fulfilment.quantity + 1 })
                }
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink hover:bg-surface-sunken"
              >
                <Plus size={14} />
              </motion.button>
            </span>
          </div>
        </Section>

        <Section title="Included">
          <dl className="flex flex-col">
            {[
              ["Mailer", `${envelope.flap === "euro" ? "Euro flap" : "Square flap"} · natural stock`],
              ["Region", "United States · First-class postage"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-0"
              >
                <dt className="text-[13px] text-ink-faint">{k}</dt>
                <dd className="text-right text-[13px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
