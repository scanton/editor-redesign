"use client";

import { PlacementLayer } from "@/components/canvas/placement-layer";
import { findLongForm } from "@/lib/long-form";
import { LONG_FORM_NODE_ID, useEditorStore, useNode } from "@/store/editor-store";
import type { DrawNode } from "@/lib/types";

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
  const setLongForm = useEditorStore((s) => s.setLongForm);
  const updateNode = useEditorStore((s) => s.updateNode);
  const signature = useNode<DrawNode>("inside_signature");

  // Marking up the card takes the pointer; the two must never overlap.
  if (marking) return null;

  if (tool === "longform" && face === longForm.face) {
    const option = findLongForm(longForm.kind);
    return (
      <PlacementLayer
        viewport={viewport}
        rect={longForm.rect}
        label={option?.label ?? "Long-form text"}
        onChange={(rect) => setLongForm({ rect })}
        onCommit={(rect) => {
          if (longForm.status !== "placed") return;
          updateNode(
            LONG_FORM_NODE_ID,
            { x: rect.x, y: rect.y, width: rect.width },
            true,
          );
        }}
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
