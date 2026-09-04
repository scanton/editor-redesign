"use client";

import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { PanelBody, Section, Toggle } from "@/components/rail/panels/parts";
import { PRINT_SPEC } from "@/lib/fulfilment";
import { findTrim } from "@/lib/invitation";
import { staggerParent } from "@/lib/motion";
import { findEnvelopeLook } from "@/lib/digital-card";
import {
  ENVELOPE_ADD_ON,
  QUANTITY_BREAKS,
  breakFor,
  priceOf,
  unitPrice,
} from "@/lib/pricing";
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
  const product = useEditorStore((s) => s.product);
  const orientation = useEditorStore((s) => s.invitation.orientation);
  const trim = useEditorStore((s) => findTrim(s.invitation.trim));
  const envelopeAddOn = useEditorStore((s) => s.envelopeAddOn);
  const setEnvelopeAddOn = useEditorStore((s) => s.setEnvelopeAddOn);
  const isInvitation = product === "invitation";

  const tier = breakFor(product, quantity);
  const base = priceOf("printed", product).unit;
  const each = unitPrice(product, "printed", quantity);

  const spec: [string, string][] = [
    ...(isInvitation
      ? ([
          ["Trim", `A7 · ${orientation === "portrait" ? "5×7 portrait" : "7×5 landscape"}`],
        ] as [string, string][])
      : []),
    ["Stock", PRINT_SPEC.stock],
    [
      "Corners",
      isInvitation
        ? trim.radiusIn > 0
          ? `${trim.label} · ${trim.radiusIn}" radius`
          : trim.label
        : PRINT_SPEC.corners,
    ],
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

          {isInvitation && (
            <div className="mt-2.5 rounded-[12px] bg-surface-sunken/70 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-ink-soft">
                  {tier ? `${tier.from}+ price` : "Each"}
                </span>
                <span className="text-[13.5px] font-semibold tabular-nums text-ink">
                  ${each.toFixed(2)}
                  {tier && (
                    <span className="ml-1.5 text-[12px] font-medium text-ink-faint line-through">
                      ${base.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-ink-faint">
                {tier
                  ? `${Math.round(tier.discount * 100)}% off at ${tier.from} or more.`
                  : `Invitations go out to a guest list, so they break at ${QUANTITY_BREAKS.map((b) => b.from).join(", ")}.`}
              </p>
            </div>
          )}
        </Section>

        {isInvitation && (
          <Section title="Envelopes">
            <label className="flex items-center justify-between gap-3 rounded-[12px] border border-hairline px-3.5 py-3">
              <span>
                <span className="block text-[14px] font-medium text-ink">
                  Add envelopes
                </span>
                <span className="mt-0.5 block text-[12px] text-ink-faint tabular-nums">
                  ${ENVELOPE_ADD_ON.toFixed(2)} per invitation
                </span>
              </span>
              <Toggle
                checked={envelopeAddOn}
                onChange={setEnvelopeAddOn}
                label="Add envelopes"
              />
            </label>
            <p className="mt-2.5 text-[12px] leading-snug text-ink-faint">
              A greeting card comes with its mailer. Invitations are often
              hand-delivered or already have envelopes, so they are chosen.
            </p>
          </Section>
        )}

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
            {isInvitation
              ? "One stock, cut the way you chose under Trim. The stock is a production decision, not a customer one."
              : "One stock, square corners. Changing either is a production change, not a customer choice."}
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
