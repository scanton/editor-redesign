"use client";

import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import {
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
} from "@/components/rail/panels/parts";
import { springTight, staggerParent } from "@/lib/motion";
import { findStyle } from "@/lib/art-styles";
import {
  REVEAL_PRESETS,
  findBackground,
  findEnvelopeLook,
  findRevealStep,
} from "@/lib/digital-card";
import { findLanguage } from "@/lib/languages";
import { findLongForm } from "@/lib/long-form";
import { priceOf } from "@/lib/pricing";
import { useEditorStore, useNode } from "@/store/editor-store";
import { useWarnings } from "@/lib/warnings";
import type { DrawNode, TextNode } from "@/lib/types";

/** Everything decided, grouped by the step it was decided in. */
export function ReviewPanel() {
  const cardType = useEditorStore((s) => s.cardType);
  const styles = useEditorStore((s) => s.selectedStyles);
  const language = useEditorStore((s) => s.targetLanguage);
  const longForm = useEditorStore((s) => s.longForm);
  const envelope = useEditorStore((s) => s.envelope);
  const digital = useEditorStore((s) => s.digital);
  const setStep = useEditorStore((s) => s.setStep);
  const setTool = useEditorStore((s) => s.setTool);
  const warnings = useWarnings();

  const message = useNode<TextNode>("inside_message");
  const signature = useNode<DrawNode>("inside_signature");
  const signed =
    (signature?.strokes.length ?? 0) > 0 || !!signature?.typed?.text;

  const type = priceOf(cardType);
  const option = findLongForm(longForm.kind);

  const rows: [string, string, string][] = [
    ["Create", "Art style", findStyle(styles[0] ?? null)?.label ?? "Not chosen"],
    ["Create", "Message", message?.text ? "Written" : "Empty"],
    [
      "Create",
      "Long-form",
      longForm.status === "placed"
        ? (option?.label ?? "Uploaded text") + " · placed inside"
        : "None",
    ],
    ["Create", "Signature", signed ? "Signed" : "Not signed"],
    [
      "Create",
      "Language",
      findLanguage(language)?.name ?? "English (unchanged)",
    ],
    ["Personalize", "Card type", type.label],
  ];

  if (cardType === "digital") {
    const preset = REVEAL_PRESETS.find((p) => p.id === digital.reveal.preset);
    const playing = digital.reveal.sequence.filter(
      (id) => !digital.reveal.skipped.includes(id),
    );
    const runtime = playing.reduce((n, id) => n + findRevealStep(id).seconds, 0);
    rows.push(
      ["Personalize", "Scene", findBackground(digital.background).label],
      [
        "Personalize",
        "Envelope",
        findEnvelopeLook(digital.envelopeLook)?.label ?? "Custom set",
      ],
      [
        "Personalize",
        "Reveal",
        `${preset?.label ?? "Fixed animation"} · ${runtime.toFixed(1)}s`,
      ],
      [
        "Personalize",
        "Cover",
        digital.cover.on ? "Sealed until opened" : "Peek of the card",
      ],
    );
  } else {
    rows.push(
      [
        "Personalize",
        "Envelope",
        `${envelope.flap === "euro" ? "Euro flap" : "Square flap"} · ${envelope.font}`,
      ],
      ["Personalize", "Mailing to", envelope.recipient.name || "Not addressed"],
    );
  }

  const groups = ["Create", "Personalize"] as const;

  return (
    <>
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

          {groups.map((group) => (
            <Section key={group} title={group}>
              <dl className="flex flex-col">
                {rows
                  .filter((r) => r[0] === group)
                  .map(([, key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-0"
                    >
                      <dt className="shrink-0 text-[13px] text-ink-faint">
                        {key}
                      </dt>
                      <dd className="min-w-0 truncate text-right text-[13.5px] font-medium text-ink">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Section>
          ))}

          <Section title="Total">
            <div className="flex items-baseline justify-between rounded-[12px] bg-surface-sunken/70 px-3.5 py-3">
              <span className="text-[13px] text-ink-soft">
                1 × {type.label}
              </span>
              <span className="font-display text-[19px] font-semibold tabular-nums text-ink">
                {type.price.replace(" each", "")}
              </span>
            </div>
          </Section>
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <PrimaryButton
          onClick={() => {
            setStep(1);
            setTool("styles");
          }}
        >
          Prepare for cart
        </PrimaryButton>
        <p className="mt-2 text-center text-[11.5px] text-ink-faint">
          Stub — checkout is outside this proposal.
        </p>
      </PanelFooter>
    </>
  );
}
