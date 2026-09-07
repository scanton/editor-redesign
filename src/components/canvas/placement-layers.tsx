"use client";

import { LongFormEditor } from "@/components/canvas/long-form-editor";
import { PlacementLayer } from "@/components/canvas/placement-layer";
import { findLongForm } from "@/lib/long-form";
import {
  longFormBoxActive,
  useEditorStore,
  useNode,
} from "@/store/editor-store";
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
  const longFormActive = useEditorStore(longFormBoxActive);
  const editing = useEditorStore((s) => s.editingLongForm);
  const setEditing = useEditorStore((s) => s.setEditingLongForm);
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

  if (longFormActive) {
    // Typing takes the whole box, so the editor replaces the handles rather
    // than fighting them for the pointer.
    if (editing) return <LongFormEditor viewport={viewport} />;

    const option = findLongForm(longForm.kind);
    return (
      <PlacementLayer
        viewport={viewport}
        rect={longForm.rect}
        label={`${option?.label ?? "Long-form text"} · click to edit`}
        // The artwork steps back so the block can be read against it.
        dim
        // Refit as it moves, so the type is always filling the box rather than
        // snapping to size when you let go.
        onChange={(rect) => refitLongForm(rect)}
        onCommit={(rect) => refitLongForm(rect, longForm.status === "placed")}
        onActivate={() => setEditing(true)}
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
