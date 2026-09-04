"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { springBouncy, springTight } from "@/lib/motion";
import {
  cardTransform,
  toCardPoint,
  toScreenRect,
} from "@/lib/card-transform";
import {
  pointInPolygon,
  rectToSvgPoints,
  toSvgPoints,
} from "@/lib/lasso";
import type { AnnotationRect } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";
import { clamp } from "@/lib/utils";

/** Anything smaller than this is a stray click, not a region. */
const MIN_REGION = 24;
const PROMPT_WIDTH = 288;
const PROMPT_GAP = 12;

/**
 * Marking out a region of the card by outline — click a segment the model
 * already found, or drag a rectangle around something it did not. Painting a
 * region is the brush layer's job; both end in the same prompt and the same
 * re-render shimmer.
 *
 * DOM rather than Konva, because Konva can't host a text input.
 */
export function RegionLayer({
  viewport,
}: {
  viewport: { width: number; height: number };
}) {
  const mode = useEditorStore((s) => s.canvasMode);
  const setMode = useEditorStore((s) => s.setCanvasMode);
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const zoom = useEditorStore((s) => s.zoom);
  const draft = useEditorStore((s) => s.draftAnnotation);
  const setDraft = useEditorStore((s) => s.setDraftAnnotation);
  const lasso = useEditorStore((s) => s.draftLasso);
  const setLasso = useEditorStore((s) => s.setDraftLasso);
  const submit = useEditorStore((s) => s.submitAnnotation);
  const requests = useEditorStore((s) => s.annotationRequests);
  const hoverSegment = useEditorStore((s) => s.hoverSegment);
  const setHoverSegment = useEditorStore((s) => s.setHoverSegment);
  const selectSegment = useEditorStore((s) => s.selectSegment);

  const hostRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  // Pointer moves can coalesce into a single task, so React may not re-render
  // between them. These refs are the source of truth during a gesture; store
  // state mirrors them for rendering.
  const pathRef = useRef<number[]>([]);
  const draftRef = useRef<AnnotationRect | null>(null);
  const [instruction, setInstruction] = useState("");
  // The prompt only appears once the gesture ends, so this has to drive a render.
  const [drawing, setDrawing] = useState(false);
  const maskId = useId();

  const drawingMode = mode === "annotate";
  const picking = mode === "element";
  const marking = drawingMode || picking;
  const segments = face.segments ?? [];
  const hovered = segments.find((seg) => seg.id === hoverSegment) ?? null;
  const transform = cardTransform(viewport, face, zoom);

  // Regions the agent is "re-rendering" right now, on this face.
  const rendering = requests.filter(
    (r) => r.status === "rendering" && r.face === face.id,
  );

  const cancel = useCallback(() => {
    originRef.current = null;
    pathRef.current = [];
    draftRef.current = null;
    setDrawing(false);
    setDraft(null);
    setLasso(null);
    setInstruction("");
  }, [setDraft, setLasso]);

  useEffect(() => {
    if (!marking && !draft) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (draft) cancel();
      else if (mode !== "element") setMode("element");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [marking, draft, mode, cancel, setMode]);

  const localPoint = (e: ReactPointerEvent) => {
    const rect = hostRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /** Clamp to the card so you can't mark the empty canvas around it. */
  const clampToCard = (p: { x: number; y: number }) => ({
    x: clamp(p.x, 0, face.width),
    y: clamp(p.y, 0, face.height),
  });

  /** Topmost segment under a card-space point; segments are most-specific first. */
  const segmentAt = (p: { x: number; y: number }) =>
    segments.find((seg) => pointInPolygon(p.x, p.y, seg.points)) ?? null;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (draft) return;

    // Element mode is a click, not a drag: the outline already exists.
    if (picking) {
      const hit = segmentAt(clampToCard(toCardPoint(localPoint(e), transform)));
      if (hit) selectSegment(hit);
      return;
    }

    if (!drawingMode) return;
    // Throws NotFoundError if the pointer is already gone; not worth failing over.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const start = clampToCard(toCardPoint(localPoint(e), transform));
    originRef.current = start;
    setDrawing(true);

    const zero = { x: start.x, y: start.y, width: 0, height: 0 };
    draftRef.current = zero;
    setDraft(zero);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (picking) {
      if (draft) return;
      const hit = segmentAt(clampToCard(toCardPoint(localPoint(e), transform)));
      setHoverSegment(hit?.id ?? null);
      return;
    }

    const origin = originRef.current;
    if (!origin) return;
    const current = clampToCard(toCardPoint(localPoint(e), transform));
    draftRef.current = rectBetween(origin, current);
    setDraft(draftRef.current);
  };

  const onPointerUp = () => {
    const origin = originRef.current;
    const finalDraft = draftRef.current;
    originRef.current = null;
    setDrawing(false);
    if (!origin || !finalDraft) return;
    // Too small to be intentional — treat it as a misclick and reset.
    if (finalDraft.width < MIN_REGION || finalDraft.height < MIN_REGION) cancel();
  };

  const send = () => {
    if (!instruction.trim()) return;
    submit(instruction);
    pathRef.current = [];
    draftRef.current = null;
    setInstruction("");
  };

  const screen = draft ? toScreenRect(draft, transform) : null;

  /** The marked shape as SVG points — a traced path, or the box's corners. */
  const draftShape =
    lasso && lasso.length >= 4
      ? toSvgPoints(lasso, transform)
      : draft && draft.width > 0
        ? rectToSvgPoints(draft, transform)
        : null;

  /** What the spotlight cuts out: the committed region, else what's under the pointer. */
  const spotlightShape =
    draftShape ?? (hovered ? toSvgPoints(hovered.points, transform) : null);

  // In Element mode the hint names what you are about to pick; in the drawing
  // modes it explains the gesture. With neither, it stays out of the way.
  const showHint = !draft && (drawingMode || Boolean(hovered));

  return (
    <div
      ref={hostRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => setHoverSegment(null)}
      className="absolute inset-0 z-20"
      style={{
        pointerEvents: marking || draft ? "auto" : "none",
        cursor: !marking || draft ? "default" : picking ? "pointer" : "crosshair",
      }}
    >
      {/* Spotlight + outlines. One SVG covers both shapes: the marked region is
          punched out of the dimming layer with a mask. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {spotlightShape && (
              <polygon points={spotlightShape} fill="black" />
            )}
          </mask>
        </defs>

        <AnimatePresence>
          {/* Element is the resting mode, so it only dims once you are actually
              pointing at something. The drawing modes dim on entry. */}
          {(drawingMode || spotlightShape) && (
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="100%"
              height="100%"
              fill="rgb(22 22 26 / 0.22)"
              mask={`url(#${maskId})`}
            />
          )}
        </AnimatePresence>

        {!draftShape && hovered && (
          <polygon
            points={toSvgPoints(hovered.points, transform)}
            fill="rgb(190 29 44 / 0.06)"
            stroke="var(--color-brand-red)"
            strokeWidth={2}
            strokeDasharray="7 5"
            strokeLinejoin="round"
          />
        )}

        {draftShape && (
          <polygon
            points={draftShape}
            fill="rgb(190 29 44 / 0.08)"
            stroke="var(--color-brand-red)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}

        {/* Regions currently being re-rendered by the agent. Anything painted
            shimmers as the strokes that marked it; anything outlined shimmers
            as its outline. */}
        {rendering.map((request) =>
          request.strokes ? (
            <g key={request.id} className="animate-pulse">
              {request.strokes.map((stroke, i) => (
                <polyline
                  key={i}
                  points={toSvgPoints(stroke, transform)}
                  fill="none"
                  stroke="rgb(255 255 255 / 0.4)"
                  strokeWidth={(request.brushSize ?? 90) * transform.scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ) : (
            <polygon
              key={request.id}
              points={
                request.points
                  ? toSvgPoints(request.points, transform)
                  : rectToSvgPoints(request.rect, transform)
              }
              fill="rgb(255 255 255 / 0.18)"
              stroke="rgb(213 35 43 / 0.7)"
              strokeWidth={2}
              strokeLinejoin="round"
              className="animate-pulse"
            />
          ),
        )}
      </svg>

      {/* Instruction input, parked beside the region. */}
      <AnimatePresence>
        {screen && !drawing && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
            transition={springBouncy}
            style={{ ...promptPosition(screen, viewport), width: PROMPT_WIDTH }}
            className="pointer-events-auto absolute rounded-[16px] border border-hairline bg-surface p-2.5 shadow-pop"
          >
            <div className="mb-2 flex items-center justify-between pl-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-faint">
                Edit this area
              </span>
              <motion.button
                type="button"
                aria-label="Cancel region"
                onClick={cancel}
                whileHover={{ scale: 1.12, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={springTight}
                className="flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-surface-sunken hover:text-ink"
              >
                <X size={14} />
              </motion.button>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                autoFocus
                rows={2}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Make the cap gold…"
                className="min-w-0 flex-1 resize-none rounded-[10px] bg-surface-sunken px-3 py-2 text-[13.5px] leading-snug text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <motion.button
                type="button"
                aria-label="Send instruction"
                onClick={send}
                disabled={!instruction.trim()}
                whileHover={instruction.trim() ? { scale: 1.1, rotate: -6 } : undefined}
                whileTap={instruction.trim() ? { scale: 0.9 } : undefined}
                transition={springBouncy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition-opacity disabled:opacity-35"
              >
                <ArrowUp size={17} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode hint. Sits clear of the toolbar, which owns top-centre. */}
      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={springBouncy}
            className="pointer-events-none absolute left-1/2 top-[84px] -translate-x-1/2 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-medium text-white shadow-pop"
          >
            {mode === "element"
              ? hovered?.label + " · click to edit it"
              : "Drag a box around what you want changed · Esc to exit"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function rectBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
): AnnotationRect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/** Prefer the right of the region; flip left, then clamp, if it won't fit. */
function promptPosition(
  box: { left: number; top: number; width: number; height: number },
  viewport: { width: number; height: number },
) {
  const rightEdge = box.left + box.width + PROMPT_GAP;
  const left =
    rightEdge + PROMPT_WIDTH <= viewport.width
      ? rightEdge
      : Math.max(8, box.left - PROMPT_GAP - PROMPT_WIDTH);

  return {
    left,
    top: clamp(box.top, 8, Math.max(8, viewport.height - 150)),
  };
}
