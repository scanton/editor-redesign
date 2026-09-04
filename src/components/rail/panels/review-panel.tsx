"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { PanelBody, Section } from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import { findStyle } from "@/lib/art-styles";
import {
  REVEAL_PRESETS,
  describeScene,
  findEnvelopeLook,
  findRevealStep,
} from "@/lib/digital-card";
import {
  DIGITAL_DELIVERY,
  PRINTED_DELIVERY,
  PRINT_SPEC,
  upsellFor,
} from "@/lib/fulfilment";
import { findLanguage } from "@/lib/languages";
import { findLongForm } from "@/lib/long-form";
import { filledRows } from "@/lib/event-details";
import { priceOf } from "@/lib/pricing";
import { useEditorStore, useNode } from "@/store/editor-store";
import { useWarnings } from "@/lib/warnings";
import type { DrawNode, TextNode } from "@/lib/types";
import { cn } from "@/lib/utils";

type Row = { step: string; key: string; value: string };

/** Everything decided, grouped by the step it was decided in. */
export function ReviewPanel() {
  const cardType = useEditorStore((s) => s.cardType);
  const styles = useEditorStore((s) => s.selectedStyles);
  const language = useEditorStore((s) => s.targetLanguage);
  const longForm = useEditorStore((s) => s.longForm);
  const envelope = useEditorStore((s) => s.envelope);
  const digital = useEditorStore((s) => s.digital);
  const fulfilment = useEditorStore((s) => s.fulfilment);
  const alsoInCart = useEditorStore((s) => s.alsoInCart);
  const setAlsoInCart = useEditorStore((s) => s.setAlsoInCart);
  const total = useEditorStore((s) => s.orderTotal());
  const warnings = useWarnings();
  const [upsellOff, setUpsellOff] = useState(false);
  const product = useEditorStore((s) => s.product);
  const invitation = useEditorStore((s) => s.invitation);
  // The list always carries a trailing blank row; it is not a detail yet.
  const detailRows = filledRows(invitation.details);
  const printedCount = detailRows.filter((d) => d.onInvitation).length;

  const message = useNode<TextNode>("inside_message");
  const signature = useNode<DrawNode>("inside_signature");
  const signed =
    (signature?.strokes.length ?? 0) > 0 || !!signature?.typed?.text;

  const isDigital = cardType === "digital";
  const type = priceOf(cardType, product);
  const other = priceOf(isDigital ? "printed" : "digital", product);
  const option = findLongForm(longForm.kind);
  const upsell = upsellFor(cardType);

  const isInvitation = product === "invitation";

  // An invitation is described rather than written, so what there is to check
  // before it goes out is the event data and whether the artwork matches it.
  const rows: Row[] = isInvitation
    ? [
        {
          step: "Create",
          key: "Art style",
          value: findStyle(styles[0] ?? null)?.label ?? "Not chosen",
        },
        { step: "Create", key: "Event", value: invitation.eventName || "Unnamed" },
        {
          step: "Create",
          key: "When",
          value: [invitation.date, invitation.time].filter(Boolean).join(" · ") || "Not set",
        },
        {
          step: "Create",
          key: "Where",
          value:
            [invitation.locationName, invitation.address].filter(Boolean).join(" · ") ||
            "Not set",
        },
        {
          step: "Create",
          key: "On the artwork",
          value: `${printedCount} of ${detailRows.length} extra detail${
            detailRows.length === 1 ? "" : "s"
          }`,
        },
        {
          step: "Create",
          key: "RSVP",
          value: invitation.rsvpOn
            ? `${invitation.rsvpValue || "No destination"}${invitation.qrOn ? " · QR on the back" : " · no QR"}`
            : "Not collecting",
        },
        {
          step: "Create",
          key: "Artwork",
          value: invitation.stale ? "Behind the details" : "Up to date",
        },
        {
          step: "Personalize",
          key: "Format",
          value: `${type.label} · ${
            invitation.orientation === "portrait" ? "5×7 portrait" : "7×5 landscape"
          }`,
        },
      ]
    : [
        {
          step: "Create",
          key: "Art style",
          value: findStyle(styles[0] ?? null)?.label ?? "Not chosen",
        },
        { step: "Create", key: "Message", value: message?.text ? "Written" : "Empty" },
        {
          step: "Create",
          key: "Long-form",
          value:
            longForm.status === "placed"
              ? `${option?.label ?? "Uploaded text"} · placed inside`
              : "None",
        },
        { step: "Create", key: "Signature", value: signed ? "Signed" : "Not signed" },
        {
          step: "Create",
          key: "Language",
          value: findLanguage(language)?.name ?? "English",
        },
        { step: "Personalize", key: "Card type", value: type.label },
      ];

  if (isDigital) {
    const preset = REVEAL_PRESETS.find((p) => p.id === digital.reveal.preset);
    const runtime = digital.reveal.sequence
      .filter((id) => !digital.reveal.skipped.includes(id))
      .reduce((n, id) => n + findRevealStep(id).seconds, 0);
    rows.push(
      {
        step: "Personalize",
        key: "Scene",
        value: describeScene(digital.scene),
      },
      {
        step: "Personalize",
        key: "Envelope",
        value: findEnvelopeLook(digital.envelopeLook)?.label ?? "Custom set",
      },
      {
        step: "Personalize",
        key: "Reveal",
        value: `${preset?.label ?? "Fixed animation"} · ${runtime.toFixed(1)}s`,
      },
      {
        step: "Personalize",
        key: "Cover",
        value: digital.cover.on ? "Sealed until opened" : "Peek of the card",
      },
      {
        step: "Finish",
        key: "Delivery",
        value:
          DIGITAL_DELIVERY.find((d) => d.id === fulfilment.digitalDelivery)
            ?.label ?? "",
      },
      {
        step: "Finish",
        key: "Recipients",
        value: plural(fulfilment.recipients.length, "recipient"),
      },
    );
  } else {
    rows.push(
      {
        step: "Personalize",
        key: "Mailer",
        value: `${envelope.flap === "euro" ? "Euro flap" : "Square flap"} · natural stock`,
      },
      {
        step: "Finish",
        key: "Delivery",
        value:
          PRINTED_DELIVERY.find((d) => d.id === fulfilment.printedDelivery)
            ?.label ?? "",
      },
      {
        step: "Finish",
        key: "Mailing to",
        value: plural(fulfilment.recipients.length, "address", "addresses"),
      },
      {
        step: "Finish",
        key: "Print",
        value: `${plural(fulfilment.quantity, "copy", "copies")} · ${PRINT_SPEC.stock}`,
      },
    );
  }

  const units = isDigital
    ? plural(fulfilment.recipients.length, "digital send")
    : plural(fulfilment.quantity, "printed card");

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        {warnings.length > 0 && (
          <Section title="Before you send">
            <div className="flex flex-col gap-2">
              {warnings.map((warning) => (
                <motion.button
                  key={warning.id}
                  type="button"
                  onClick={warning.go}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.99 }}
                  transition={springTight}
                  className="flex items-start gap-2.5 rounded-[12px] border border-hairline bg-surface p-3 text-left hover:border-hairline-strong"
                >
                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0 text-brand-red"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-ink">
                      {warning.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-ink-faint">
                      {warning.note}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </Section>
        )}

        <Section>
          <div className="overflow-hidden rounded-[13px] border border-hairline">
            {rows.map((row, i) => (
              <div
                key={row.step + row.key}
                className={cn(
                  "flex items-baseline gap-3 px-3 py-2.5",
                  i > 0 && "border-t border-hairline",
                )}
              >
                <span className="w-[74px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
                  {row.step}
                </span>
                <span className="shrink-0 text-[13px] text-ink-soft">
                  {row.key}
                </span>
                <span className="ml-auto min-w-0 text-right text-[13px] font-medium text-ink">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <div className="rounded-[13px] bg-surface-sunken/70 px-3.5 py-3">
            <span className="block text-[12px] text-ink-soft">{units}</span>
            <span className="mt-0.5 block font-display text-[26px] font-semibold leading-none tabular-nums text-ink">
              ${total.toFixed(2)}
            </span>
            {alsoInCart && (
              <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-ink-soft">
                <Check size={13} className="text-brand-red" />
                {other.label} added
              </span>
            )}
          </div>
        </Section>

        {/* The other rendition, offered once and never nagged. */}
        <AnimatePresence>
          {!upsellOff && !alsoInCart && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: springBouncy },
                exit: { opacity: 0, y: 8, transition: { duration: 0.14 } },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Section>
                <div className="relative rounded-[13px] border border-brand-red/35 bg-brand-red/5 p-3.5">
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setUpsellOff(true)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-surface hover:text-ink"
                  >
                    <X size={13} />
                  </button>
                  <span className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-brand-red">
                    {upsell.badge}
                  </span>
                  <span className="mt-1 block text-[14.5px] font-semibold text-ink">
                    {upsell.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-ink-soft">
                    {upsell.body}
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => setAlsoInCart(true)}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springTight}
                    className="mt-3 w-full rounded-full bg-brand-red py-2.5 text-[13.5px] font-semibold text-white shadow-rail hover:bg-brand-red-hover"
                  >
                    {upsell.cta}
                  </motion.button>
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PanelBody>
  );
}

function plural(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}
