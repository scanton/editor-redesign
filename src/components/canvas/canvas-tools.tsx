"use client";

import { motion } from "motion/react";
import { Eraser, Lasso, Scan, SquareDashedMousePointer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CanvasMode } from "@/lib/types";
import { Tooltip } from "@/components/ui/tooltip";
import { springBouncy, springTight } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type Mode = {
  id: CanvasMode;
  label: string;
  hint: string;
  icon: LucideIcon;
};

const MODES: Mode[] = [
  {
    id: "element",
    label: "Element",
    hint: "Click anything the model found — a face, the type, the background",
    icon: Scan,
  },
  {
    id: "annotate",
    label: "Annotate",
    hint: "Box an area and tell the agent what to change",
    icon: SquareDashedMousePointer,
  },
  {
    id: "wand",
    label: "Magic Wand",
    hint: "Draw around anything and say what to change",
    icon: Lasso,
  },
  {
    id: "eraser",
    label: "Magic Eraser",
    hint: "Paint over something to remove it",
    icon: Eraser,
  },
];

/**
 * Pointer modes sit centred above the card rather than off in a corner: they
 * act on the card, so they read as belonging to it. The face switcher holds the
 * matching position below.
 */
export function CanvasTools() {
  const active = useEditorStore((s) => s.canvasMode);
  const setMode = useEditorStore((s) => s.setCanvasMode);

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0, transition: { duration: 0.16 } }}
      transition={{ ...springBouncy, delay: 0.1 }}
      className="pointer-events-auto absolute left-1/2 top-5 z-30 flex -translate-x-1/2 gap-1 rounded-[18px] border border-hairline bg-surface/85 p-1.5 shadow-rail backdrop-blur"
    >
      {MODES.map((mode) => {
        const isActive = active === mode.id;
        const Icon = mode.icon;
        return (
          <Tooltip
            key={mode.id}
            label={
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold">{mode.label}</span>
                <span className="opacity-70">{mode.hint}</span>
              </span>
            }
            side="bottom"
          >
            <motion.button
              type="button"
              aria-label={mode.label}
              aria-pressed={isActive}
              onClick={() => setMode(mode.id)}
              whileHover={{ scale: 1.08, y: 2 }}
              whileTap={{ scale: 0.92 }}
              transition={springTight}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-[13px] transition-colors",
                isActive ? "text-white" : "text-ink-soft hover:text-ink",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="canvas-mode-pill"
                  transition={springBouncy}
                  className="absolute inset-0 rounded-[13px] bg-ink"
                />
              )}
              <Icon size={19} className="relative" strokeWidth={1.9} />
            </motion.button>
          </Tooltip>
        );
      })}
    </motion.div>
  );
}
