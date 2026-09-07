"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Eraser,
  Highlighter,
  Scan,
  SquareDashedMousePointer,
  Trash2,
} from "lucide-react";
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
    id: "highlighter",
    label: "Magic Highlighter",
    hint: "Paint over an area and say what to change",
    icon: Highlighter,
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
  const selection = useSelection();

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

      {/* The trash joins the toolbar only when there is something to throw
          away, and names what that is — a bare bin over a card is a threat. */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={springBouncy}
            className="flex items-center overflow-hidden"
          >
            <span className="mx-1 h-6 w-px shrink-0 bg-hairline" />
            <Tooltip label={`Delete ${selection.label}`} side="bottom">
              <motion.button
                type="button"
                aria-label={`Delete ${selection.label}`}
                onClick={selection.remove}
                whileHover={{ scale: 1.08, y: 2 }}
                whileTap={{ scale: 0.92 }}
                transition={springTight}
                className="flex h-10 w-10 items-center justify-center rounded-[13px] text-ink-soft transition-colors hover:bg-brand-red/10 hover:text-brand-red"
              >
                <Trash2 size={18} strokeWidth={1.9} />
              </motion.button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * What the trash would act on. Derived from primitives rather than selected as
 * an object — a selector that builds one on every read is a new snapshot on
 * every read, and the store spins.
 */
function useSelection() {
  const tool = useEditorStore((s) => s.activeTool);
  const stickerId = useEditorStore((s) => s.selectedSticker);
  const stickerLabel = useEditorStore(
    (s) =>
      s.doc.faces[s.face].nodes.find(
        (n) => n.kind === "sticker" && n.id === s.selectedSticker,
      )?.name ?? null,
  );
  const blockPlaced = useEditorStore((s) => s.longForm.status === "placed");
  const remove = useEditorStore((s) => s.deleteSelection);

  if (tool === "stickers" && stickerId && stickerLabel)
    return { label: stickerLabel, remove };
  if (tool === "longform" && blockPlaced)
    return { label: "this text", remove };
  return null;
}
