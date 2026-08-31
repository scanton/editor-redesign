"use client";

import { motion } from "motion/react";
import { PanelBody, Section, Toggle } from "@/components/rail/panels/parts";
import { springTight, staggerParent } from "@/lib/motion";
import { COVER_LAYOUTS, type CoverLayout } from "@/lib/digital-card";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/** What the recipient reads before the envelope opens. */
export function CoverPanel() {
  const cover = useEditorStore((s) => s.digital.cover);
  const setCover = useEditorStore((s) => s.setCover);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <div className="flex items-center gap-3 rounded-[13px] border border-hairline p-3.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-ink">
                Cover
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-faint">
                Recipients read this before opening the envelope.
              </span>
            </span>
            <Toggle
              checked={cover.on}
              onChange={(on) => setCover({ on })}
              label="Show a cover"
            />
          </div>
        </Section>

        <Section>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              ["showSender", "Show sender"],
              ["showAvatar", "Show avatar"],
            ].map(([key, label]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-[12px] border border-hairline px-3 py-2.5 transition-opacity",
                  !cover.on && "opacity-40",
                )}
              >
                <span className="text-[13px] font-medium text-ink">{label}</span>
                <Toggle
                  checked={cover[key as "showSender" | "showAvatar"]}
                  onChange={(next) => setCover({ [key]: next })}
                  label={label}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Layout">
          <div
            className={cn(
              "grid grid-cols-2 gap-2.5 transition-opacity",
              !cover.on && "opacity-40",
            )}
          >
            {COVER_LAYOUTS.map((layout) => {
              const on = cover.layout === layout.id;
              return (
                <motion.button
                  key={layout.id}
                  type="button"
                  aria-label={layout.label}
                  onClick={() => setCover({ layout: layout.id })}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springTight}
                  className={cn(
                    "rounded-[13px] border-2 bg-surface-sunken/50 p-3 transition-colors",
                    on
                      ? "border-brand-red"
                      : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  <LayoutSketch id={layout.id} />
                  <span className="mt-2 block text-[12px] font-medium text-ink">
                    {layout.label}
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

/** Wireframe of where the sender, avatar and note sit. */
function LayoutSketch({ id }: { id: CoverLayout }) {
  const bar = "block rounded-full bg-hairline-strong";
  const dot = "block h-2 w-2 rounded-full bg-brand-red";

  if (id === "stacked") {
    return (
      <span className="flex h-12 flex-col items-center justify-center gap-1.5">
        <span className={dot} />
        <span className={`${bar} h-1.5 w-16`} />
        <span className={`${bar} h-1.5 w-10`} />
      </span>
    );
  }
  if (id === "minimal") {
    return (
      <span className="flex h-12 flex-col items-center justify-center gap-1.5">
        <span className={`${bar} h-1.5 w-16`} />
        <span className={`${bar} h-1.5 w-12`} />
      </span>
    );
  }
  if (id === "avatar-left") {
    return (
      <span className="flex h-12 items-center justify-center gap-2">
        <span className="block h-6 w-6 rounded-[5px] bg-brand-red" />
        <span className="flex flex-col gap-1.5">
          <span className={`${bar} h-1.5 w-10`} />
          <span className={`${bar} h-1.5 w-7`} />
        </span>
      </span>
    );
  }
  return (
    <span className="flex h-12 flex-col items-center justify-center gap-1.5">
      <span className={`${bar} h-1.5 w-16`} />
      <span className={dot} />
    </span>
  );
}
