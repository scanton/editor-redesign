"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Eraser, Highlighter } from "lucide-react";
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
 * The two painting tools. Both work the same way — pick a brush, paint over
 * the area you mean, and the mask is what the brush covered. Aiming a thick
 * brush at a thing is easier than tracing a careful outline around it, which
 * is why the highlighter gave up being a lasso.
 *
 * They differ only in what happens next: the eraser needs no instruction,
 * because "remove this" is the whole message; the highlighter asks what to
 * change. Strokes are held in card coordinates so they survive zooming.
 */
export function BrushLayer({
  viewport,
}: {
  viewport: { width: number; height: number };
}) {
  const mode = useEditorStore((s) => s.canvasMode);
  const setMode = useEditorStore((s) => s.setCanvasMode);
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const zoom = useEditorStore((s) => s.zoom);
  const strokes = useEditorStore((s) => s.brushStrokes);
  const setStrokes = useEditorStore((s) => s.setBrushStrokes);
  const size = useEditorStore((s) => s.brushSize);
  const setSize = useEditorStore((s) => s.setBrushSize);
  const clear = useEditorStore((s) => s.clearBrush);
  const submitErase = useEditorStore((s) => s.submitErase);
  const submitAnnotation = useEditorStore((s) => s.submitAnnotation);

  const hostRef = useRef<HTMLDivElement>(null);
  // Pointer moves coalesce, so the live stroke lives in a ref during a gesture.
  const strokesRef = useRef<number[][]>([]);
  const paintingRef = useRef(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [instruction, setInstruction] = useState("");

  const erasing = mode === "eraser";
  const active = erasing || mode === "highlighter";
  const transform = cardTransform(viewport, face, zoom);

  // Amber for the one that marks, red for the one that removes. Two brushes
  // that behave identically need to be told apart at a glance.
  const paint = erasing ? "213 35 43" : "217 141 20";

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
    setInstruction("");
    setMode("element");
  };

  const send = () => {
    if (!instruction.trim()) return;
    submitAnnotation(instruction);
    strokesRef.current = [];
    setInstruction("");
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
              stroke={`rgb(${paint} / 0.35)`}
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
              fill={`rgb(${paint} / 0.35)`}
            />
          ) : null,
        )}

        {/* Brush cursor — a real brush tool should show its own footprint. */}
        {cursor && (
          <circle
            cx={cursor.x}
            cy={cursor.y}
            r={brushOnScreen / 2}
            fill={`rgb(${paint} / 0.12)`}
            stroke={`rgb(${paint})`}
            strokeWidth={1.5}
          />
        )}
      </svg>

      {/* Brush controls. Fixed under the toolbar rather than beside the paint —
          the size needs setting before the first stroke, when there's no
          region to sit next to. */}
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springBouncy}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="pointer-events-auto absolute left-1/2 top-[84px] w-max -translate-x-1/2 rounded-[18px] border border-hairline bg-surface/95 px-3.5 py-2.5 shadow-pop backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
            {erasing ? (
              <Eraser size={15} className="text-ink-soft" />
            ) : (
              <Highlighter size={15} className="text-ink-soft" />
            )}
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
              className="rounded-full"
              style={{
                width: clamp(size / 9, 6, 26),
                height: clamp(size / 9, 6, 26),
                background: `rgb(${paint} / 0.3)`,
                boxShadow: `0 0 0 1px rgb(${paint})`,
              }}
            />
          </span>

          {erasing && (
            <>
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
                onClick={submitErase}
                disabled={!hasPaint}
                whileHover={hasPaint ? { scale: 1.04, y: -1 } : undefined}
                whileTap={hasPaint ? { scale: 0.96 } : undefined}
                transition={springTight}
                className="rounded-full bg-brand-red px-4 py-1.5 text-[13px] font-semibold text-white shadow-rail transition-opacity disabled:opacity-35"
              >
                Erase
              </motion.button>
            </>
          )}
        </div>

        {/* The highlighter's prompt joins the same card once there is paint, so
            the brush stays usable underneath — you can keep adding to the mask
            while the instruction sits there. */}
        <AnimatePresence initial={false}>
          {!erasing && hasPaint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTight}
              className="overflow-hidden"
            >
              <div className="mt-2.5 flex w-[360px] items-center gap-2 border-t border-hairline pt-2.5">
                <input
                  autoFocus
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                    if (e.key === "Escape") cancel();
                  }}
                  placeholder="Tell Stampy what to change here"
                  className="min-w-0 flex-1 rounded-[12px] border border-hairline bg-surface px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-ink-faint focus:outline-none"
                />
                <motion.button
                  type="button"
                  onClick={cancel}
                  whileTap={{ scale: 0.95 }}
                  transition={springTight}
                  className="shrink-0 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-surface-sunken hover:text-ink"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={send}
                  aria-label="Send"
                  disabled={!instruction.trim()}
                  whileHover={instruction.trim() ? { scale: 1.06 } : undefined}
                  whileTap={instruction.trim() ? { scale: 0.94 } : undefined}
                  transition={springTight}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-white shadow-rail transition-opacity disabled:opacity-35"
                >
                  <ArrowUp size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!hasPaint && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springBouncy, delay: 0.1 }}
          className="pointer-events-none absolute left-1/2 top-[144px] -translate-x-1/2 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-medium text-white shadow-pop"
        >
          {erasing
            ? "Paint over whatever should go · Esc to exit"
            : "Paint over the area you want changed · Esc to exit"}
        </motion.p>
      )}
    </div>
  );
}
