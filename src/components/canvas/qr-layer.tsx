"use client";

import { motion } from "motion/react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { cardTransform } from "@/lib/card-transform";
import { springTight } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";

const MIN_WIDTH = 0.1;
const MAX_WIDTH = 0.34;

/**
 * Drag handles for the RSVP code. The code itself is drawn on the canvas below
 * — this is only the grab area, so it appears while the Event panel is open
 * and gets out of the way otherwise.
 *
 * Everything is held as a fraction of the panel: the code keeps its place when
 * the invitation flips between portrait and landscape.
 */
export function QrLayer({
  viewport,
}: {
  viewport: { width: number; height: number };
}) {
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const zoom = useEditorStore((s) => s.zoom);
  const qr = useEditorStore((s) => s.invitation.qr);
  const moveQr = useEditorStore((s) => s.moveQr);

  // Pointer moves coalesce, so the gesture is tracked in a ref rather than
  // read back out of a render closure.
  const dragRef = useRef<{
    mode: "move" | "resize";
    origin: { x: number; y: number };
    start: { x: number; y: number; width: number };
  } | null>(null);

  const transform = cardTransform(viewport, face, zoom);
  const size = qr.width * face.width * transform.scale;
  const left = transform.x + qr.x * face.width * transform.scale - size / 2;
  const top = transform.y + qr.y * face.height * transform.scale - size / 2;

  function begin(mode: "move" | "resize", e: ReactPointerEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      origin: { x: e.clientX, y: e.clientY },
      start: { ...qr },
    };
  }

  function move(e: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.origin.x) / (face.width * transform.scale);
    const dy = (e.clientY - drag.origin.y) / (face.height * transform.scale);

    if (drag.mode === "move") {
      moveQr({ x: drag.start.x + dx, y: drag.start.y + dy });
      return;
    }
    // Resizing pulls from the corner, so the code grows about its centre at
    // twice the travel.
    const width = Math.max(
      MIN_WIDTH,
      Math.min(MAX_WIDTH, drag.start.width + dx * 2),
    );
    moveQr({ x: drag.start.x, y: drag.start.y }, width);
  }

  function end(e: ReactPointerEvent<HTMLElement>) {
    if (!dragRef.current) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={springTight}
        onPointerDown={(e) => begin("move", e)}
        onPointerMove={(e) => move(e)}
        onPointerUp={(e) => end(e)}
        onPointerCancel={(e) => end(e)}
        title="Drag to move"
        className="pointer-events-auto absolute cursor-grab rounded-[10px] ring-2 ring-brand-red/0 transition-[box-shadow] hover:ring-brand-red active:cursor-grabbing"
        style={{ left, top, width: size, height: size }}
      >
        <span
          onPointerDown={(e) => begin("resize", e)}
          onPointerMove={(e) => move(e)}
          onPointerUp={(e) => end(e)}
          onPointerCancel={(e) => end(e)}
          title="Drag to resize"
          className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-brand-red bg-surface shadow-sm"
        />
      </motion.div>

      <span
        className="absolute whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[11px] font-semibold text-white"
        style={{ left, top: top - 26 }}
      >
        RSVP code
      </span>
    </div>
  );
}
