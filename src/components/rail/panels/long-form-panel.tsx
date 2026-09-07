"use client";

import { motion } from "motion/react";
import { Check, MessageCircle, Move, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import {
  PanelBody,
  Section,
  Segmented,
} from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import {
  CUT_SAFE_MARGIN,
  LENGTHS,
  LONG_FORM_GROUPS,
  PX_PER_INCH,
  findLongForm,
  type LongFormLength,
} from "@/lib/long-form";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * What to write, how long, and where it goes. How it actually gets written is
 * not here — picking a kind hands the question to the agent, because "who is
 * doing the writing" is a conversation, not a setting.
 */
export function LongFormPanel() {
  const longForm = useEditorStore((s) => s.longForm);
  const setLongForm = useEditorStore((s) => s.setLongForm);
  const chooseApproach = useEditorStore((s) => s.chooseApproach);
  const resetPlacement = useEditorStore((s) => s.resetLongFormPlacement);
  const setFace = useEditorStore((s) => s.setFace);
  const face = useEditorStore((s) => s.face);

  // The block lands inside, so show inside while you're placing it.
  useEffect(() => {
    if (face !== longForm.face) setFace(longForm.face);
    // Only on open — switching faces by hand afterwards is the user's call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const option = findLongForm(longForm.kind);
  const inches = (px: number) => (px / PX_PER_INCH).toFixed(1);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        {LONG_FORM_GROUPS.map((group) => (
          <Section key={group.label} title={group.label}>
            <div className="grid grid-cols-2 gap-2">
              {group.options.map((item) => {
                const isOn = longForm.kind === item.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const next = isOn ? null : item.id;
                      setLongForm({ kind: next });
                      // A new kind reopens the question of who writes it.
                      chooseApproach(null);
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springTight}
                    className={cn(
                      "relative rounded-[13px] border p-2.5 text-left transition-colors",
                      isOn
                        ? "border-ink bg-surface-sunken"
                        : "border-hairline hover:border-hairline-strong",
                    )}
                  >
                    <span className="block pr-4 text-[13px] font-semibold leading-tight text-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-faint">
                      {item.blurb}
                    </span>
                    {isOn && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={springBouncy}
                        className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-white"
                      >
                        <Check size={10} strokeWidth={3} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Section>
        ))}

        {option && (
          <Section>
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTight}
              className="flex gap-2 rounded-[12px] bg-surface-sunken/70 p-3 text-[12.5px] leading-snug text-ink-soft"
            >
              <MessageCircle size={15} className="mt-px shrink-0 text-brand-red" />
              <span>
                Stampy is asking how you want to handle the writing — answer in
                the panel on the right.
              </span>
            </motion.p>
          </Section>
        )}

        <Section title="Length">
          <Segmented
            id="long-form-length"
            options={LENGTHS.map((l) => ({ value: l.value, label: l.label }))}
            value={longForm.length}
            onChange={(length) =>
              setLongForm({ length: length as LongFormLength })
            }
          />
          <p className="mt-2 text-[12px] text-ink-faint">
            {LENGTHS.find((l) => l.value === longForm.length)?.words} — then set
            to fill the box you place on the card.
          </p>
        </Section>

        <Section
          title="Placement"
          action={
            <motion.button
              type="button"
              onClick={resetPlacement}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={springTight}
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium text-ink-soft hover:bg-surface-sunken hover:text-ink"
            >
              <RotateCcw size={13} />
              Reset
            </motion.button>
          }
        >
          <div className="rounded-[12px] bg-surface-sunken/70 p-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <Move size={14} className="text-ink-faint" />
              {inches(longForm.rect.width)}″ × {inches(longForm.rect.height)}″
              on the inside spread
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-faint">
              Drag the box on the card to move it, or pull a corner to resize —
              the type refits as you go. It stays{" "}
              {(CUT_SAFE_MARGIN / PX_PER_INCH).toFixed(1)}″ clear of the trim
              edge so nothing is lost when the card is cut.
            </p>
          </div>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
