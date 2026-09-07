"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { cardTransform, toScreenRect } from "@/lib/card-transform";
import { fontCssVar } from "@/lib/fonts";
import { springTight } from "@/lib/motion";
import { LONG_FORM_NODE_ID, useEditorStore, useNode } from "@/store/editor-store";
import type { TextNode } from "@/lib/types";

/**
 * Editing the block where it sits. A textarea laid exactly over the box and
 * set in the same face, size and colour as the render, so the words are edited
 * in the place they will be read rather than in a field somewhere else.
 *
 * Konva cannot host an input, so the type underneath is hidden while this is
 * open and this stands in for it. The type refits as you go, which is the same
 * behaviour as dragging the box — the block is always filling its space.
 */
export function LongFormEditor({
  viewport,
}: {
  viewport: { width: number; height: number };
}) {
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const zoom = useEditorStore((s) => s.zoom);
  const rect = useEditorStore((s) => s.longForm.rect);
  const fill = useEditorStore((s) => s.longForm.fill);
  const fontFamily = useEditorStore((s) => s.longForm.fontFamily);
  const setText = useEditorStore((s) => s.setLongFormText);
  const close = useEditorStore((s) => s.setEditingLongForm);
  const node = useNode<TextNode>(LONG_FORM_NODE_ID);

  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const area = ref.current;
    if (!area) return;
    area.focus();
    // Land at the end rather than selecting everything — most people arrive
    // here to change a line, not to replace the lot.
    area.setSelectionRange(area.value.length, area.value.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const transform = cardTransform(viewport, face, zoom);
  const box = toScreenRect(rect, transform);
  // Fall back to the block's own settings before there is a node to read.
  const size = (node?.fontSize ?? 34) * transform.scale;

  return (
    <div className="absolute inset-0 z-30">
      {/* Anywhere outside the words closes the editor, which is what clicking
          away means everywhere else. */}
      <div className="absolute inset-0" onPointerDown={() => close(false)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springTight}
        className="absolute rounded-[6px] border-2 border-brand-red"
        style={box}
      >
        <span className="absolute -top-7 left-0 whitespace-nowrap rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-semibold text-white">
          Editing · Esc to finish
        </span>

        <textarea
          ref={ref}
          value={node?.text ?? ""}
          onChange={(e) => setText(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          spellCheck
          placeholder="Type or paste your words…"
          className="scroll-slim h-full w-full resize-none bg-transparent p-0 caret-white focus:outline-none"
          style={{
            color: fill,
            fontFamily: fontCssVar(node?.fontFamily ?? fontFamily),
            fontSize: size,
            lineHeight: node?.lineHeight ?? 1.45,
          }}
        />
      </motion.div>
    </div>
  );
}
