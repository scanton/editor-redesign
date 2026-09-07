"use client";

import { motion } from "motion/react";
import {
  Check,
  Loader2,
  MessageCircle,
  Move,
  RotateCcw,
  Square,
  SquareDashed,
} from "lucide-react";
import { useEffect } from "react";
import {
  ColorWheelButton,
  Field,
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  Segmented,
  Select,
  SwatchGrid,
} from "@/components/rail/panels/parts";
import { CARD_FONTS, RECOMMENDED_COLORS, fontCssVar } from "@/lib/fonts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import {
  CUT_SAFE_MARGIN,
  LENGTHS,
  LONG_FORM_GROUPS,
  PX_PER_INCH,
  findFrameTreatment,
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
const FONT_OPTIONS = CARD_FONTS.map((f) => ({
  value: f.id,
  label: f.label,
  sample: "Aa",
  fontFamily: f.cssVar,
}));

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
    <>
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

        {longForm.status === "placed" && <SetIn />}

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
              Click the box on the card to type into it, drag it to move, or
              pull a corner to resize — the words are yours to change, and the
              type refits whatever you do. It stays{" "}
              {(CUT_SAFE_MARGIN / PX_PER_INCH).toFixed(1)}″ clear of the trim
              edge so nothing is lost when the card is cut.
            </p>
          </div>

        </Section>
        </motion.div>
      </PanelBody>

      {/* The frame is the last decision about the block, and the one people
          come back for, so it sits where it can always be reached rather than
          somewhere in the scroll. */}
      <PanelFooter>
        <FrameControl />
      </PanelFooter>
    </>
  );
}

/** Colour and face for the block, once there is a block to set. */
function SetIn() {
  const fill = useEditorStore((s) => s.longForm.fill);
  const fontFamily = useEditorStore((s) => s.longForm.fontFamily);
  const setStyle = useEditorStore((s) => s.setLongFormStyle);

  return (
    <Section title="Set in">
      <Field label="Typeface">
        <Select
          options={FONT_OPTIONS}
          value={fontFamily}
          onChange={(next) => setStyle({ fontFamily: next })}
        />
      </Field>

      <Field label="Colour">
        <div className="flex items-start gap-3">
          <ColorWheelButton color={fill} />
          <div className="min-w-0 flex-1">
            <SwatchGrid
              colors={RECOMMENDED_COLORS}
              value={fill}
              onChange={(next) => setStyle({ fill: next })}
            />
          </div>
        </div>
      </Field>

      <p
        className="mt-1 rounded-[12px] px-3 py-2.5 text-[15px] leading-snug"
        style={{
          fontFamily: fontCssVar(fontFamily),
          color: fill,
          // The specimen sits on the panel the words will sit on.
          background: "rgba(250,248,243,0.9)",
        }}
      >
        The quick brown fox, set the way it will print.
      </p>
    </Section>
  );
}

/**
 * The frame the agent renders behind the words. It stays in view the whole
 * time the block is on the card, rather than hiding until something is
 * clicked — it is the answer to "why can I barely read that", and the moment
 * you want it is the moment you are looking at the card, not hunting a panel.
 *
 * Before there are words it has nothing to sit behind, so it says so instead
 * of disappearing.
 */
function FrameControl() {
  const status = useEditorStore((s) => s.longForm.status);
  const frame = useEditorStore((s) => s.longForm.frame);
  const treatment = useEditorStore((s) =>
    findFrameTreatment(s.longForm.frameTreatment),
  );
  const render = useEditorStore((s) => s.renderLongFormFrame);

  const busy = frame === "rendering";
  const asking = frame === "asking";
  const on = frame === "placed";
  const ready = status === "placed";

  return (
    <>
      <PrimaryButton disabled={!ready || busy} onClick={render}>
        <span className="flex items-center justify-center gap-2">
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : on ? (
            <Square size={16} />
          ) : asking ? (
            <MessageCircle size={16} />
          ) : (
            <SquareDashed size={16} />
          )}
          {busy
            ? "Re-rendering the panel…"
            : on
              ? "Remove the frame"
              : asking
                ? "Never mind"
                : "Render a frame behind this"}
        </span>
      </PrimaryButton>
      <p className="mt-2 text-center text-[11.5px] leading-snug text-ink-faint">
        {!ready
          ? "Write something first — a frame needs words to sit behind."
          : asking
            ? "Stampy is asking what to do with the artwork underneath."
            : on
              ? (treatment?.done ??
                "The artwork was re-rendered with a panel behind the words.")
              : "The shading on the card now is only for reading. A frame is rendered into the artwork and stays."}
      </p>
    </>
  );
}
