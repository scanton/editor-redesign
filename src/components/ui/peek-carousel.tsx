"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Paging carousel with peek — the centre item is focused at full size and its
 * neighbours peek in from either side. Adapted from scanton/carousel-with-peek
 * (Option A); the mechanics are the repo's, the chrome is ours and the slides
 * render live scenes rather than images.
 *
 * The centre item *is* the selection, so dragging or arrowing changes it.
 */
export type PeekItem = {
  id: string;
  label: string;
  sub?: string;
};

const SIDE_SCALE = 0.82;
const GAP = 10;
const RENDER_WINDOW = 2;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function PeekCarousel({
  items,
  selectedId,
  onSelect,
  renderItem,
  height = 132,
  label,
}: {
  items: PeekItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderItem: (item: PeekItem, isCentre: boolean) => ReactNode;
  height?: number;
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);

  // The selection is the centre slide, so the virtual index is derived from it
  // rather than stored: laps counts how far the user has wrapped, and the
  // remainder is whichever item is selected.
  // A row can be showing a list the current selection is not in — the mixed
  // Recommended row, say, while a video from the full library is set. Centre
  // the first item then, but do not claim it as selected.
  const foundIndex = items.findIndex((i) => i.id === selectedId);
  const hasSelection = foundIndex >= 0;
  const selectedIndex = hasSelection ? foundIndex : 0;
  const [laps, setLaps] = useState(0);
  const index = laps * items.length + selectedIndex;

  const move = (next: number) => {
    const nextSelected = mod(next, items.length);
    setLaps(Math.floor((next - nextSelected) / items.length));
    onSelect(items[nextSelected].id);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  // Slides are 16:9, sized to leave room for the neighbours either side.
  let slideH = height - 20;
  let slideW = (slideH * 16) / 9;
  if (width > 0 && slideW > width * 0.68) {
    slideW = width * 0.68;
    slideH = (slideW * 9) / 16;
  }
  const spacing = (slideW * (1 + SIDE_SCALE)) / 2 + GAP;

  const onPointerDown = (e: ReactPointerEvent) => {
    dragStart.current = e.clientX;
    setDragging(true);
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragStart.current === null) return;
    setDragPx(e.clientX - dragStart.current);
  };

  const endDrag = () => {
    if (dragStart.current === null) return;
    let moved = Math.round(-dragPx / spacing);
    if (moved === 0 && Math.abs(dragPx) > spacing * 0.25) {
      moved = dragPx < 0 ? 1 : -1;
    }
    if (moved !== 0) move(index + moved);
    dragStart.current = null;
    setDragPx(0);
    setDragging(false);
  };

  const slots: number[] = [];
  for (let o = -RENDER_WINDOW; o <= RENDER_WINDOW; o++) slots.push(index + o);

  return (
    <div
      ref={hostRef}
      className="relative select-none overflow-hidden rounded-[14px] bg-surface-sunken outline-none ring-1 ring-hairline focus-visible:ring-2 focus-visible:ring-brand-red"
      style={{ height, touchAction: "pan-y" }}
      tabIndex={0}
      role="listbox"
      aria-label={label}
      aria-activedescendant={`peek-${label}-${index}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") move(index - 1);
        if (e.key === "ArrowRight") move(index + 1);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {width > 0 &&
        slots.map((i) => {
          const item = items[mod(i, items.length)];
          const offset = i - index;
          const isCentre = offset === 0;
          const x = offset * spacing + dragPx;
          return (
            <button
              key={i}
              id={`peek-${label}-${i}`}
              type="button"
              role="option"
              aria-selected={isCentre && hasSelection}
              aria-label={item.label}
              onClick={() => {
                if (Math.abs(dragPx) < 5) move(i);
              }}
              className="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden rounded-[10px] shadow-rail"
              style={{
                width: slideW,
                height: slideH,
                transform: `translate(calc(-50% + ${x}px), -50%) scale(${
                  isCentre ? 1 : SIDE_SCALE
                })`,
                transition: dragging
                  ? "none"
                  : "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms, filter 350ms",
                opacity: isCentre ? 1 : 0.55,
                filter: isCentre ? "none" : "brightness(0.85)",
                zIndex: isCentre ? 2 : 1,
              }}
            >
              {renderItem(item, isCentre)}

              {isCentre && hasSelection && (
                <span className="pointer-events-none absolute inset-0 rounded-[10px] ring-2 ring-inset ring-brand-red" />
              )}

              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6 text-left">
                <span className="block truncate text-[11px] font-semibold text-white">
                  {item.label}
                </span>
                {item.sub && (
                  <span className="block truncate text-[9.5px] text-white/70">
                    {item.sub}
                  </span>
                )}
              </span>
            </button>
          );
        })}

      <Arrow dir="left" onClick={() => move(index - 1)} />
      <Arrow dir="right" onClick={() => move(index + 1)} />
    </div>
  );
}

function Arrow({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Previous" : "Next"}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface/85 p-1.5 text-ink shadow-rail backdrop-blur transition hover:bg-surface",
        dir === "left" ? "left-2" : "right-2",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
