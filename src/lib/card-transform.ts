import type { Face } from "./types";

/**
 * Floating chrome brackets the canvas — mode toolbar above, face switcher
 * below. The card centres in the band between them rather than in the raw
 * viewport, so neither one lands on top of it.
 */
export const TOOLBAR_INSET = 76;
export const SWITCHER_INSET = 96;

export type CardTransform = {
  /** Screen-space offset of the card's top-left corner. */
  x: number;
  y: number;
  scale: number;
};

/**
 * Where the card sits inside the canvas viewport. The Konva stage and the DOM
 * annotation overlay both draw against this, so it lives in one place — if they
 * disagree, the annotation rectangle lands somewhere other than what the user
 * drew a box around.
 */
export function cardTransform(
  viewport: { width: number; height: number },
  face: Pick<Face, "width" | "height">,
  zoom: number,
): CardTransform {
  const band = viewport.height - TOOLBAR_INSET - SWITCHER_INSET;
  return {
    x: (viewport.width - face.width * zoom) / 2,
    y: TOOLBAR_INSET + (band - face.height * zoom) / 2,
    scale: zoom,
  };
}

/** Screen point (relative to the canvas host) → card coordinates. */
export function toCardPoint(
  point: { x: number; y: number },
  t: CardTransform,
) {
  return { x: (point.x - t.x) / t.scale, y: (point.y - t.y) / t.scale };
}

/** Card rect → screen rect, for positioning DOM chrome over the canvas. */
export function toScreenRect(
  rect: { x: number; y: number; width: number; height: number },
  t: CardTransform,
) {
  return {
    left: t.x + rect.x * t.scale,
    top: t.y + rect.y * t.scale,
    width: rect.width * t.scale,
    height: rect.height * t.scale,
  };
}
