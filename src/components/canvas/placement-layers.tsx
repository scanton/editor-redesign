"use client";

import { motion } from "motion/react";
import { Loader2, Square, SquareDashed } from "lucide-react";
import { PlacementLayer } from "@/components/canvas/placement-layer";
import { findLongForm } from "@/lib/long-form";
import { springTight } from "@/lib/motion";
import { useEditorStore, useNode } from "@/store/editor-store";
import type { DrawNode, StickerNode } from "@/lib/types";

/**
 * Placement is owned by the panel that made the thing, not by a canvas tool.
 * Open Long-Form and its block gets a box; open Signature and the signature
 * does — which is what retired the Select tool.
 */
export function PlacementLayers({
  viewport,
}: {
  viewport: { width: number; height: number };
}) {
  const tool = useEditorStore((s) => s.activeTool);
  const marking = useEditorStore((s) => s.canvasMode !== "element");
  const face = useEditorStore((s) => s.face);

  const longForm = useEditorStore((s) => s.longForm);
  const refitLongForm = useEditorStore((s) => s.refitLongForm);
  const updateNode = useEditorStore((s) => s.updateNode);
  const signature = useNode<DrawNode>("inside_signature");
  const selectedSticker = useEditorStore((s) => s.selectedSticker);
  const sticker = useEditorStore(
    (s) =>
      (s.doc.faces[s.face].nodes.find(
        (n) => n.kind === "sticker" && n.id === s.selectedSticker,
      ) as StickerNode | undefined) ?? null,
  );

  // Marking up the card takes the pointer; the two must never overlap.
  if (marking) return null;

  if (tool === "longform" && face === longForm.face) {
    const option = findLongForm(longForm.kind);
    return (
      <PlacementLayer
        viewport={viewport}
        rect={longForm.rect}
        label={option?.label ?? "Long-form text"}
        // The artwork steps back so the block can be read against it.
        dim
        // Refit as it moves, so the type is always filling the box rather than
        // snapping to size when you let go.
        onChange={(rect) => refitLongForm(rect)}
        onCommit={(rect) => refitLongForm(rect, longForm.status === "placed")}
        actions={longForm.status === "placed" ? <FrameButton /> : undefined}
      />
    );
  }

  if (tool === "stickers" && sticker && selectedSticker) {
    return (
      <PlacementLayer
        viewport={viewport}
        showTrimNote={false}
        rect={{
          x: sticker.x,
          y: sticker.y,
          width: sticker.size,
          height: sticker.size,
        }}
        label={sticker.label}
        // Stickers are square, so the shorter side of the drag wins and the
        // glyph never stretches.
        onChange={(rect) => {
          const size = Math.min(rect.width, rect.height);
          updateNode(sticker.id, { x: rect.x, y: rect.y, size });
        }}
        onCommit={() => useEditorStore.getState().commit()}
      />
    );
  }

  if (tool === "signature" && signature && face === "inside") {
    return (
      <PlacementLayer
        viewport={viewport}
        showTrimNote={false}
        rect={{
          x: signature.x,
          y: signature.y,
          width: signature.width,
          height: signature.height,
        }}
        label="Signature"
        onChange={(rect) =>
          updateNode(signature.id, {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          })
        }
        onCommit={() => useEditorStore.getState().commit()}
      />
    );
  }

  return null;
}

/**
 * Offered once there are words on the card, because it is a fix for a problem
 * you can only see by then: copy set straight onto a busy render is hard to
 * read, and a panel behind it is the answer. A re-render, not an overlay —
 * the artwork gets worked around the cleared area.
 */
function FrameButton() {
  const frame = useEditorStore((s) => s.longForm.frame);
  const render = useEditorStore((s) => s.renderLongFormFrame);
  const busy = frame === "rendering";
  const on = frame === "placed";

  return (
    <motion.button
      type="button"
      onClick={render}
      disabled={busy}
      whileHover={busy ? undefined : { scale: 1.04, y: -1 }}
      whileTap={busy ? undefined : { scale: 0.96 }}
      transition={springTight}
      className="flex items-center gap-2 whitespace-nowrap rounded-full border border-hairline bg-surface/95 py-2 pl-3 pr-3.5 text-[13px] font-semibold text-ink shadow-pop backdrop-blur"
    >
      {busy ? (
        <Loader2 size={15} className="animate-spin text-brand-red" />
      ) : on ? (
        <Square size={15} className="text-brand-red" />
      ) : (
        <SquareDashed size={15} className="text-ink-soft" />
      )}
      {busy
        ? "Re-rendering the panel…"
        : on
          ? "Remove the frame"
          : "Render a frame behind this"}
    </motion.button>
  );
}
