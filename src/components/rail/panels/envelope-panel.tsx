"use client";

import { motion } from "motion/react";
import {
  Divider,
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  Select,
} from "@/components/rail/panels/parts";
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

  return (
    <>
      <PanelBody>
        <motion.div variants={staggerParent} initial="hidden" animate="visible">
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
