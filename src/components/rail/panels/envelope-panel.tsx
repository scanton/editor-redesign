"use client";

import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import {
  Divider,
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  Select,
  SwatchGrid,
} from "@/components/rail/panels/parts";
import {
  ENVELOPE_COLOURS,
  ENVELOPE_LOOK_ROWS,
  findEnvelopeLook,
} from "@/lib/digital-card";
import { springBouncy, staggerParent } from "@/lib/motion";
import { CARD_FONTS } from "@/lib/fonts";
import type { Envelope } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const FLAPS: { value: Envelope["flap"]; label: string }[] = [
  { value: "euro", label: "Euro flap" },
  { value: "square", label: "Square flap" },
];

const FONT_OPTIONS = CARD_FONTS.map((f) => ({
  value: f.id,
  label: f.label,
  fontFamily: f.cssVar,
}));

export function EnvelopePanel() {
  const envelope = useEditorStore((s) => s.envelope);
  const updateEnvelope = useEditorStore((s) => s.updateEnvelope);
  const digital = useEditorStore((s) => s.digital);
  const setDigital = useEditorStore((s) => s.setDigital);
  const isDigital = useEditorStore((s) => s.cardType === "digital");

  const look = findEnvelopeLook(digital.envelopeLook);

  return (
    <>
      <PanelBody>
        <motion.div variants={staggerParent} initial="hidden" animate="visible">
          {isDigital && (
            <>
              <Section>
                <p className="flex gap-2 rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
                  <Sparkles size={14} className="mt-0.5 shrink-0" />
                  <span>
                    The digital envelope opens before the card. Dress it as a
                    matched set, or fine-tune every part below.
                  </span>
                </p>
              </Section>

              <Section
                title="Envelope looks"
                action={
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-brand-red">
                    <Check size={13} />
                    {look?.label ?? "Custom"}
                  </span>
                }
              >
                <p className="mb-3 text-[12px] leading-snug text-ink-faint">
                  One tap dresses the whole envelope — colour, liner, seal and
                  stamp as a matched set.
                </p>

                {ENVELOPE_LOOK_ROWS.map((row) => (
                  <div key={row.title} className="mb-4 last:mb-0">
                    <h4 className="text-[13px] font-semibold text-ink">
                      {row.title}
                    </h4>
                    <p className="mb-2 text-[11.5px] text-ink-faint">
                      {row.note}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {row.looks.map((item) => {
                        const on = digital.envelopeLook === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setDigital({
                                envelopeLook: item.id,
                                envelopeColour: item.hex,
                              })
                            }
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            transition={springBouncy}
                            className="text-left"
                          >
                            <span
                              className={cn(
                                "relative block aspect-[4/3] overflow-hidden rounded-[9px] ring-2",
                                on
                                  ? "shadow-rail ring-ink"
                                  : "ring-black/10 hover:ring-hairline-strong",
                              )}
                              style={{ backgroundColor: item.hex }}
                            >
                              <svg
                                viewBox="0 0 100 75"
                                className="absolute inset-0 h-full w-full"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d="M0 0 L50 45 L100 0 Z"
                                  fill={item.liner}
                                />
                                <path
                                  d="M0 0 L50 45 L100 0"
                                  fill="none"
                                  stroke="rgb(0 0 0 / 0.16)"
                                  strokeWidth="1"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                              <span className="absolute left-1/2 top-[52%] h-3 w-3 -translate-x-1/2 rounded-full bg-brand-red" />
                            </span>
                            <span
                              className={cn(
                                "mt-1.5 block text-[11.5px] leading-tight",
                                on
                                  ? "font-semibold text-ink"
                                  : "text-ink-soft",
                              )}
                            >
                              {item.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </Section>

              <Divider />

              <Section title="Fine-tune">
                <h4 className="mb-2 text-[13px] font-semibold text-ink">
                  Envelope colour
                </h4>
                <SwatchGrid
                  colors={ENVELOPE_COLOURS}
                  value={digital.envelopeColour}
                  onChange={(hex) =>
                    // Touching one part moves you off the matched set.
                    setDigital({ envelopeColour: hex, envelopeLook: null })
                  }
                />
              </Section>
            </>
          )}

          <Section title="Flap style">
            <div className="grid grid-cols-2 gap-3">
              {FLAPS.map((flap) => {
                const active = envelope.flap === flap.value;
                return (
                  <motion.button
                    key={flap.value}
                    type="button"
                    onClick={() => updateEnvelope({ flap: flap.value })}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springBouncy}
                    className={cn(
                      "rounded-[14px] border-2 bg-gradient-to-b from-[#e9eefb] to-[#d6def3] px-4 pb-3 pt-5 transition-colors",
                      active
                        ? "border-ink"
                        : "border-transparent hover:border-hairline-strong",
                    )}
                  >
                    <FlapThumb flap={flap.value} />
                    <span className="mt-3 block text-center text-[14px] font-bold text-ink">
                      {flap.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Section>

          <Divider />

          <Section title="Font">
            <Select
              options={FONT_OPTIONS}
              value={envelope.font}
              onChange={(font) => updateEnvelope({ font })}
            />
          </Section>
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <PrimaryButton>Save</PrimaryButton>
      </PanelFooter>
    </>
  );
}

function FlapThumb({ flap }: { flap: Envelope["flap"] }) {
  return (
    <svg viewBox="0 0 120 84" className="w-full drop-shadow-sm">
      <rect x="2" y="2" width="116" height="80" rx="4" fill="#fff" />
      {flap === "euro" ? (
        <path
          d="M2 2 L60 48 L118 2"
          fill="none"
          stroke="#c9cfdd"
          strokeWidth="1.5"
        />
      ) : (
        <line x1="2" y1="26" x2="118" y2="26" stroke="#c9cfdd" strokeWidth="1.5" />
      )}
    </svg>
  );
}
