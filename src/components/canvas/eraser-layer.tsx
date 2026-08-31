"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eraser } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { springBouncy, springTight } from "@/lib/motion";
import { cardTransform, toCardPoint } from "@/lib/card-transform";
import { appendPoint, toSvgPoints } from "@/lib/lasso";
import { useEditorStore } from "@/store/editor-store";
import { clamp } from "@/lib/utils";

/**
 * Magic eraser. Paint over whatever should go, adjust the brush, then submit —
 * there's no instruction to write, because "remove this" is the whole message.
 * Strokes are kept in card coordinates so they survive zooming.
 */
export function EraserLayer({
  viewport,
}: {
  viewport: { width: number; height: number };
}) {
  const mode = useEditorStore((s) => s.canvasMode);
  const setMode = useEditorStore((s) => s.setCanvasMode);
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const zoom = useEditorStore((s) => s.zoom);
  const strokes = useEditorStore((s) => s.eraserStrokes);
  const setStrokes = useEditorStore((s) => s.setEraserStrokes);
  const size = useEditorStore((s) => s.eraserSize);
  const setSize = useEditorStore((s) => s.setEraserSize);
  const clear = useEditorStore((s) => s.clearEraser);
  const submit = useEditorStore((s) => s.submitErase);

  const hostRef = useRef<HTMLDivElement>(null);
  // Pointer moves coalesce, so the live stroke lives in a ref during a gesture.
  const strokesRef = useRef<number[][]>([]);
  const paintingRef = useRef(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const active = mode === "eraser";
  const transform = cardTransform(viewport, face, zoom);

  // Keep the ref in step when the store is cleared from elsewhere.
  useEffect(() => {
    if (strokes.length === 0) strokesRef.current = [];
  }, [strokes]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("element");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, setMode]);

  if (!active) return null;

  const localPoint = (e: ReactPointerEvent) => {
    const rect = hostRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const cardPoint = (e: ReactPointerEvent) => {
    const p = toCardPoint(localPoint(e), transform);
    return {
      x: clamp(p.x, 0, face.width),
      y: clamp(p.y, 0, face.height),
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const p = cardPoint(e);
    paintingRef.current = true;
    strokesRef.current = [...strokesRef.current, [p.x, p.y]];
    setStrokes(strokesRef.current);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    setCursor(localPoint(e));
    if (!paintingRef.current) return;
    const p = cardPoint(e);
    const current = strokesRef.current[strokesRef.current.length - 1];
    strokesRef.current = [
      ...strokesRef.current.slice(0, -1),
      appendPoint(current, p.x, p.y, 4),
    ];
    setStrokes(strokesRef.current);
  };

  const stopPainting = () => {
    paintingRef.current = false;
  };

  const cancel = () => {
    strokesRef.current = [];
    clear();
    setMode("element");
  };

  const hasPaint = strokes.some((s) => s.length >= 2);
  const brushOnScreen = size * transform.scale;

  return (
    <div
      ref={hostRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopPainting}
      onPointerCancel={stopPainting}
      onPointerLeave={() => {
        stopPainting();
        setCursor(null);
      }}
      className="absolute inset-0 z-20 cursor-none"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {strokes.map((stroke, i) =>
          stroke.length >= 4 ? (
            <polyline
              key={i}
              points={toSvgPoints(stroke, transform)}
              fill="none"
              stroke="rgb(213 35 43 / 0.35)"
              strokeWidth={brushOnScreen}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : stroke.length === 2 ? (
            // A single tap still marks a dot.
            <circle
              key={i}
              cx={transform.x + stroke[0] * transform.scale}
              cy={transform.y + stroke[1] * transform.scale}
              r={brushOnScreen / 2}
              fill="rgb(213 35 43 / 0.35)"
            />
          ) : null,
        )}

        {/* Brush cursor — a real brush tool should show its own footprint. */}
        {cursor && (
          <circle
            cx={cursor.x}
            cy={cursor.y}
            r={brushOnScreen / 2}
            fill="rgb(213 35 43 / 0.12)"
            stroke="var(--color-brand-red)"
            strokeWidth={1.5}
          />
        )}
      </svg>

      {/* Brush controls. Fixed under the toolbar rather than beside the paint —
          the size needs setting before the first stroke, when there's no
          region to sit next to. */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={springBouncy}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute left-1/2 top-[84px] flex -translate-x-1/2 items-center gap-3 rounded-[18px] border border-hairline bg-surface/95 px-3.5 py-2.5 shadow-pop backdrop-blur"
        >
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
            <Eraser size={15} className="text-ink-soft" />
            Brush
          </span>

          <input
            type="range"
            min={20}
            max={260}
            step={5}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-32 accent-brand-red"
            aria-label="Brush size"
          />

          {/* Dot preview, capped so a fat brush doesn't blow out the bar. */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
            <span
              className="rounded-full bg-brand-red/30 ring-1 ring-brand-red"
              style={{
                width: clamp(size / 9, 6, 26),
                height: clamp(size / 9, 6, 26),
              }}
            />
          </span>

          <span className="h-6 w-px bg-hairline" />

          <motion.button
            type="button"
            onClick={cancel}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={springTight}
            className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-surface-sunken hover:text-ink"
          >
            Cancel
          </motion.button>

          <motion.button
            type="button"
            onClick={submit}
            disabled={!hasPaint}
            whileHover={hasPaint ? { scale: 1.04, y: -1 } : undefined}
            whileTap={hasPaint ? { scale: 0.96 } : undefined}
            transition={springTight}
            className="rounded-full bg-brand-red px-4 py-1.5 text-[13px] font-semibold text-white shadow-rail transition-opacity disabled:opacity-35"
          >
            Erase
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {!hasPaint && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springBouncy, delay: 0.1 }}
          className="pointer-events-none absolute left-1/2 top-[144px] -translate-x-1/2 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-medium text-white shadow-pop"
        >
          Paint over whatever should go · Esc to exit
        </motion.p>
      )}
    </div>
  );
}
