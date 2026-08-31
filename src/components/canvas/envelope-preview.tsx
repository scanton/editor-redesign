"use client";

import { motion } from "motion/react";
import { fontCssVar } from "@/lib/fonts";
import { springHeavy } from "@/lib/motion";
import { findEnvelopeLook } from "@/lib/digital-card";
import { useEditorStore } from "@/store/editor-store";

/**
 * Opening the Envelope tool swaps the canvas from the card to the envelope —
 * back showing the flap, front showing the addresses.
 */
export function EnvelopePreview() {
  const envelope = useEditorStore((s) => s.envelope);
  const zoom = useEditorStore((s) => s.zoom);
  const colour = useEditorStore((s) => s.digital.envelopeColour);
  const look = useEditorStore((s) => findEnvelopeLook(s.digital.envelopeLook));
  const isDigital = useEditorStore((s) => s.cardType === "digital");
  const body = isDigital ? colour : "#ffffff";
  const liner = isDigital ? (look?.liner ?? "#f1efe9") : "#f4f2ec";
  const font = fontCssVar(envelope.font);

  const width = 760 * Math.max(zoom, 0.3) * 1.6;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative" style={{ width, aspectRatio: "10 / 9" }}>
        {/* Back of the envelope, tucked behind and to the upper right. */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20, rotate: 2 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          transition={{ ...springHeavy, delay: 0.06 }}
          className="absolute right-0 top-0 aspect-[10/7] w-[72%] rounded-[4px] shadow-card"
          style={{ backgroundColor: body }}
        >
          <svg viewBox="0 0 100 70" className="h-full w-full" preserveAspectRatio="none">
            {envelope.flap === "euro" ? (
              <>
                <path d="M0 0 L50 42 L100 0 Z" fill={liner} />
                <path
                  d="M0 0 L50 42 L100 0"
                  fill="none"
                  stroke="rgb(0 0 0 / 0.14)"
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            ) : (
              <line
                x1="0"
                y1="24"
                x2="100"
                y2="24"
                stroke="#e4e6ec"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </motion.div>

        {/* Front, carrying the addresses. */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springHeavy}
          className="absolute bottom-0 left-0 aspect-[10/7] w-[72%] rounded-[4px] p-[6%] shadow-card"
          style={{ fontFamily: font, backgroundColor: body }}
        >
          <address className="not-italic leading-snug text-ink">
            <span className="block text-[0.9em]">{envelope.sender.name}</span>
            <span className="block text-[0.9em]">{envelope.sender.line1}</span>
            <span className="block text-[0.9em]">{envelope.sender.line2}</span>
          </address>

          <address className="absolute left-[30%] top-[46%] not-italic leading-snug text-ink">
            <span className="block text-[0.82em]">{envelope.recipient.name}</span>
            <span className="block text-[0.82em]">{envelope.recipient.line1}</span>
            <span className="block text-[0.82em]">{envelope.recipient.line2}</span>
          </address>
        </motion.div>
      </div>
    </div>
  );
}
