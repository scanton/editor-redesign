"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { springBouncy } from "@/lib/motion";
import type { Stroke } from "@/lib/types";

/**
 * Genuinely functional — draw with a pointer and the strokes go onto the card.
 * Points are captured in the pad's own pixel space and rescaled at render time.
 */
export function SignaturePad({
  strokes,
  onChange,
  color,
  thickness,
  onMeasure,
}: {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
  color: string;
  thickness: number;
  /** Reports the capture space so the saved strokes can be rescaled. */
  onMeasure?: (size: { width: number; height: number }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [size, setSize] = useState({ width: 432, height: 160 });

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      setSize(next);
      onMeasure?.(next);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [onMeasure]);

  const pointFrom = (e: PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const start = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrawing(true);
    onChange([...strokes, { points: pointFrom(e), width: thickness, color }]);
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drawing) return;
    const [x, y] = pointFrom(e);
    const next = strokes.slice();
    const last = next[next.length - 1];
    next[next.length - 1] = { ...last, points: [...last.points, x, y] };
    onChange(next);
  };

  const end = () => setDrawing(false);

  return (
    <div className="relative">
      <div
        ref={ref}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="h-[160px] w-full touch-none rounded-[14px] border border-hairline bg-surface"
      >
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          {strokes.map((stroke, i) => (
            <polyline
              key={i}
              points={toPolyline(stroke.points)}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      <AnimatePresence>
        {strokes.length > 0 && (
          <motion.button
            type="button"
            aria-label="Clear signature"
            onClick={() => onChange([])}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.12, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={springBouncy}
            className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-sunken text-ink-soft hover:text-ink"
          >
            <X size={15} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function toPolyline(points: number[]) {
  const pairs: string[] = [];
  for (let i = 0; i < points.length; i += 2) {
    pairs.push(`${points[i]},${points[i + 1]}`);
  }
  return pairs.join(" ");
}
