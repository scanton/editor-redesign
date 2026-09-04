"use client";

import { motion } from "motion/react";
import { Link2, Mail, MessageSquare, Package, Send, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PanelBody, Section } from "@/components/rail/panels/parts";
import { springTight, staggerParent } from "@/lib/motion";
import {
  digitalDeliveryFor,
  PRINTED_DELIVERY,
  type DigitalDelivery,
  type PrintedDelivery,
} from "@/lib/fulfilment";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  link: Link2,
  email: Mail,
  sms: MessageSquare,
  video: Video,
  mail: Send,
  ship: Package,
};

/** A delivery option without an icon should look plain, not take the panel down. */
function iconFor(id: string): LucideIcon {
  return ICONS[id] ?? Send;
}

/** How the card reaches them. Different question for each rendition. */
export function DeliveryPanel() {
  const isDigital = useEditorStore((s) => s.cardType === "digital");
  const product = useEditorStore((s) => s.product);
  const fulfilment = useEditorStore((s) => s.fulfilment);
  const setFulfilment = useEditorStore((s) => s.setFulfilment);

  const options = isDigital ? digitalDeliveryFor(product) : PRINTED_DELIVERY;
  const current = isDigital
    ? fulfilment.digitalDelivery
    : fulfilment.printedDelivery;

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <div className="flex flex-col gap-2.5">
            {options.map((option) => {
              const on = current === option.id;
              const Icon = iconFor(option.id);
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() =>
                    setFulfilment(
                      isDigital
                        ? { digitalDelivery: option.id as DigitalDelivery }
                        : { printedDelivery: option.id as PrintedDelivery },
                    )
                  }
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTight}
                  className={cn(
                    "flex items-start gap-3 rounded-[14px] border-2 p-3.5 text-left transition-colors",
                    on
                      ? "border-brand-red bg-brand-red/5"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  <Icon
                    size={17}
                    className={cn(
                      "mt-0.5 shrink-0",
                      on ? "text-brand-red" : "text-ink-soft",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold text-ink">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-faint">
                      {option.note}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2",
                      on ? "border-brand-red" : "border-hairline-strong",
                    )}
                    style={{ width: 18, height: 18 }}
                  >
                    {on && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={springTight}
                        className="block h-2 w-2 rounded-full bg-brand-red"
                      />
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
