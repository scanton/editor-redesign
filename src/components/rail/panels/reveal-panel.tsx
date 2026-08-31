"use client";

import { Reorder, motion } from "motion/react";
import {
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  Maximize2,
  MoveRight,
  Music,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PanelBody,
  PlannedBadge,
  Section,
  Toggle,
} from "@/components/rail/panels/parts";
import { springTight, staggerParent } from "@/lib/motion";
import { REVEAL_PRESETS, findRevealStep } from "@/lib/digital-card";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const PRESET_ICONS: Record<string, LucideIcon> = {
  rise: ArrowUp,
  flip: RefreshCw,
  slide: MoveRight,
  fade: Sparkles,
  unfold: Maximize2,
};

/**
 * How the card opens on the recipient's screen. Today's card ships one fixed
 * animation — everything here is designed and not built, which the Planned
 * badges say out loud rather than leaving to be discovered.
 */
export function RevealPanel() {
  const reveal = useEditorStore((s) => s.digital.reveal);
  const setReveal = useEditorStore((s) => s.setReveal);
  const toggleStep = useEditorStore((s) => s.toggleRevealStep);

  const total = reveal.sequence
    .filter((id) => !reveal.skipped.includes(id))
    .reduce((n, id) => n + findRevealStep(id).seconds, 0);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <p className="flex gap-2 rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              Today the reveal is a single fixed animation. Everything below is
              proposed, not built — it is here so we can agree the shape before
              it is scoped.
            </span>
          </p>
        </Section>

        <Section
          title="Reveal preset"
          action={<PlannedBadge />}
        >
          <div className="grid grid-cols-3 gap-2.5">
            {REVEAL_PRESETS.map((preset) => {
              const on = reveal.preset === preset.id;
              const Icon = PRESET_ICONS[preset.id];
              return (
                <motion.button
                  key={preset.id}
                  type="button"
                  onClick={() => setReveal({ preset: preset.id })}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springTight}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-[13px] border-2 px-2 py-3 transition-colors",
                    on
                      ? "border-brand-red bg-brand-red/5"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  <Icon
                    size={17}
                    className={on ? "text-brand-red" : "text-ink-soft"}
                  />
                  <span className="text-center text-[11.5px] font-semibold leading-tight text-ink">
                    {preset.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-ink-faint">
                    {preset.seconds.toFixed(1)}s
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        <Section title="Sequence" action={<PlannedBadge />}>
          <p className="mb-2.5 text-[12px] text-ink-faint">
            Drag to reorder. Hide a step to skip it.
          </p>

          <Reorder.Group
            axis="y"
            values={reveal.sequence}
            onReorder={(sequence: string[]) => setReveal({ sequence })}
            className="flex flex-col gap-2"
          >
            {reveal.sequence.map((id) => {
              const step = findRevealStep(id);
              const skipped = reveal.skipped.includes(id);
              return (
                <Reorder.Item
                  key={id}
                  value={id}
                  className="flex items-center gap-2.5 rounded-[12px] border border-hairline bg-surface px-3 py-2.5"
                >
                  <GripVertical
                    size={15}
                    className="shrink-0 cursor-grab text-ink-faint active:cursor-grabbing"
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13.5px] font-medium",
                      skipped ? "text-ink-faint line-through" : "text-ink",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="shrink-0 text-[12px] tabular-nums text-ink-faint">
                    {skipped ? "skipped" : `${step.seconds.toFixed(1)}s`}
                  </span>
                  <button
                    type="button"
                    aria-label={skipped ? `Include ${step.label}` : `Skip ${step.label}`}
                    onClick={() => toggleStep(id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-surface-sunken hover:text-ink"
                  >
                    {skipped ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          <p className="mt-2.5 text-right text-[12px] tabular-nums text-ink-soft">
            {total.toFixed(1)}s total
          </p>
        </Section>

        <Section title="Soundtrack" action={<PlannedBadge />}>
          <div className="flex items-center gap-3 rounded-[12px] border border-hairline p-3">
            <Music size={16} className="shrink-0 text-ink-soft" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-ink">
                Play a track
              </span>
              <span className="block text-[12px] text-ink-faint">
                Plays on tap, never autoplays
              </span>
            </span>
            <Toggle
              checked={reveal.music}
              onChange={(music) => setReveal({ music })}
              label="Soundtrack"
            />
          </div>
        </Section>

        <Section title="Reduced motion fallback" action={<PlannedBadge />}>
          <div className="flex items-center gap-3 rounded-[12px] border border-hairline p-3">
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-ink">
                Still cover
              </span>
              <span className="block text-[12px] text-ink-faint">
                A still cover for anyone who asks for it
              </span>
            </span>
            <Toggle
              checked={reveal.reducedMotion}
              onChange={(reducedMotion) => setReveal({ reducedMotion })}
              label="Reduced motion fallback"
            />
          </div>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
