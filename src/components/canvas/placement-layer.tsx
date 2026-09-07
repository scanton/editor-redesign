"use client";

import { motion } from "motion/react";
import { useId, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { springBouncy } from "@/lib/motion";
import { cardTransform, toCardPoint, toScreenRect } from "@/lib/card-transform";
import { CUT_SAFE_MARGIN, PX_PER_INCH, safeArea } from "@/lib/long-form";
import { useEditorStore } from "@/store/editor-store";
import type { AnnotationRect } from "@/lib/types";
import { clamp } from "@/lib/utils";

const MIN_SIZE = 160;

type Handle = "nw" | "ne" | "sw" | "se";

const HANDLES: { id: Handle; className: string; cursor: string }[] = [
  { id: "nw", className: "-left-1.5 -top-1.5", cursor: "nwse-resize" },
  { id: "ne", className: "-right-1.5 -top-1.5", cursor: "nesw-resize" },
  { id: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { id: "se", className: "-bottom-1.5 -right-1.5", cursor: "nwse-resize" },
];

/**
 * Where a block will be printed. Drag to move, corners to resize, clamped to the
 * trim-safe area — you can't place anything where the cutter will take it.
 *
 * Used by whichever panel owns a placeable piece: the long-form block, and the
 * signature (which is why the canvas no longer needs a Select tool).
 */
export function PlacementLayer({
  viewport,
  rect,
  onChange,
  onCommit,
  label,
  showTrimNote = true,
  dim = false,
  onActivate,
}: {
  viewport: { width: number; height: number };
  rect: AnnotationRect;
  onChange: (rect: AnnotationRect) => void;
  onCommit?: (rect: AnnotationRect) => void;
  label: string;
  showTrimNote?: boolean;
  /**
   * Dim the artwork outside the box. Card art is loud by design, and a block
   * of copy sitting on top of it is hard to read until everything else steps
   * back.
   */
  dim?: boolean;
  /**
   * Clicking the box — a press that moves is a drag, a press that does not is
   * a click. Corner handles never count, since sizing is not opening.
   */
  onActivate?: () => void;
}) {
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const zoom = useEditorStore((s) => s.zoom);

  const hostRef = useRef<HTMLDivElement>(null);
  const maskId = useId();
  // A gesture is a drag or a click, and which one it was is only known when it
  // ends. Kept in a ref because pointer moves coalesce and would otherwise be
  // read from a render that has not happened yet.
  const gestureRef = useRef<{ mode: "move" | Handle; moved: boolean } | null>(
    null,
  );
  const dragRef = useRef<{
    mode: "move" | Handle;
    origin: { x: number; y: number };
    start: AnnotationRect;
  } | null>(null);
  const latestRef = useRef<AnnotationRect | null>(null);

  const transform = cardTransform(viewport, face, zoom);
  const safe = safeArea(face);
  const box = toScreenRect(rect, transform);
  const safeBox = toScreenRect(safe, transform);

  const pointIn = (e: ReactPointerEvent) => {
    const host = hostRef.current!.getBoundingClientRect();
    return toCardPoint(
      { x: e.clientX - host.left, y: e.clientY - host.top },
      transform,
    );
  };

  const begin = (mode: "move" | Handle, e: ReactPointerEvent) => {
    e.stopPropagation();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}
    gestureRef.current = { mode, moved: false };
    dragRef.current = { mode, origin: pointIn(e), start: { ...rect } };
  };

  const move = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const now = pointIn(e);
    const dx = now.x - drag.origin.x;
    const dy = now.y - drag.origin.y;
    // A couple of pixels of travel is a hand shaking, not an intent to move.
    if (gestureRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      gestureRef.current.moved = true;
    }
    const next = resize(drag.mode, drag.start, dx, dy, safe);
    latestRef.current = next;
    onChange(next);
  };

  const end = () => {
    if (!dragRef.current) return;
    dragRef.current = null;

    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture && gesture.mode === "move" && !gesture.moved) {
      onActivate?.();
      return;
    }

    // The last pointermove may not have re-rendered yet, so commit from the ref
    // rather than the render closure.
    onCommit?.(latestRef.current ?? rect);
  };

  return (
    // Above the region layer: in Element mode that layer takes the whole
    // canvas so segments stay hoverable, which would otherwise swallow every
    // click meant for this box. The layer itself passes pointers through —
    // only the box and its handles catch them.
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-[25]">
      {dim && (
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              <rect {...boxAttrs(box)} rx={6} fill="black" />
            </mask>
          </defs>
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            width="100%"
            height="100%"
            fill="rgb(16 16 20 / 0.55)"
            mask={`url(#${maskId})`}
          />
        </svg>
      )}

      {/* Trim-safe boundary, so the constraint is visible rather than implied.
          Card art is arbitrary, so the guide carries its own contrast. */}
      <div
        className="absolute rounded-[4px] border border-dashed border-white/55"
        style={{
          ...safeBox,
          filter: "drop-shadow(0 0 1px rgb(0 0 0 / 0.45))",
        }}
      />

      {/* The fold — a long-form block shouldn't run across it. */}
      {face.width > face.height && (
        <div
          className="absolute w-px bg-ink/20"
          style={{
            left: transform.x + (face.width / 2) * transform.scale,
            top: transform.y,
            height: face.height * transform.scale,
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springBouncy}
        onPointerDown={(e) => begin("move", e)}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="pointer-events-auto absolute cursor-move rounded-[6px] border-2 border-brand-red bg-brand-red/5"
        style={box}
      >
        <span className="absolute -top-7 left-0 whitespace-nowrap rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-semibold text-white">
          {label}
        </span>

        {HANDLES.map((handle) => (
          <span
            key={handle.id}
            onPointerDown={(e) => begin(handle.id, e)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            style={{ cursor: handle.cursor }}
            className={`absolute h-3 w-3 rounded-full border-2 border-brand-red bg-surface ${handle.className}`}
          />
        ))}
      </motion.div>

      {/* Sits below the card, not on the artwork, so it stays readable. */}
      {showTrimNote && (
        <p
          className="absolute whitespace-nowrap rounded-full bg-surface/85 px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-rail backdrop-blur"
          style={{
            left: transform.x,
            top: transform.y + face.height * transform.scale + 10,
          }}
        >
          Dashed line = {(CUT_SAFE_MARGIN / PX_PER_INCH).toFixed(1)}″ trim-safe
          area
        </p>
      )}
    </div>
  );
}

/** Apply a drag to the rect, keeping it inside the safe area. */
function resize(
  mode: "move" | Handle,
  start: AnnotationRect,
  dx: number,
  dy: number,
  safe: AnnotationRect,
): AnnotationRect {
  const right = safe.x + safe.width;
  const bottom = safe.y + safe.height;

  if (mode === "move") {
    return {
      ...start,
      x: clamp(start.x + dx, safe.x, right - start.width),
      y: clamp(start.y + dy, safe.y, bottom - start.height),
    };
  }

  const west = mode === "nw" || mode === "sw";
  const north = mode === "nw" || mode === "ne";

  let { x, y, width, height } = start;

  if (west) {
    const nextX = clamp(start.x + dx, safe.x, start.x + start.width - MIN_SIZE);
    width = start.x + start.width - nextX;
    x = nextX;
  } else {
    width = clamp(start.width + dx, MIN_SIZE, right - start.x);
  }

  if (north) {
    const nextY = clamp(
      start.y + dy,
      safe.y,
      start.y + start.height - MIN_SIZE,
    );
    height = start.y + start.height - nextY;
    y = nextY;
  } else {
    height = clamp(start.height + dy, MIN_SIZE, bottom - start.y);
  }

  return { x, y, width, height };
}

/** The box in SVG attribute form, for the dimming mask. */
function boxAttrs(box: {
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  return { x: box.left, y: box.top, width: box.width, height: box.height };
}
