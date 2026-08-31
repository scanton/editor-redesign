import type { AnnotationRect } from "./types";
import type { CardTransform } from "./card-transform";

/**
 * Freehand regions are stored as a flat [x0, y0, x1, y1, …] list in card
 * coordinates, the same space as everything else on the card.
 */

/** Pointer events fire far faster than the shape changes — thin them out. */
export const MIN_POINT_DISTANCE = 6;

export function appendPoint(
  points: number[],
  x: number,
  y: number,
  minDistance = MIN_POINT_DISTANCE,
): number[] {
  const n = points.length;
  if (n >= 2) {
    const dx = x - points[n - 2];
    const dy = y - points[n - 1];
    if (Math.hypot(dx, dy) < minDistance) return points;
  }
  return [...points, x, y];
}

export function boundsOf(points: number[]): AnnotationRect {
  if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]);
    maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]);
    maxY = Math.max(maxY, points[i + 1]);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Card-space points → an SVG `points` attribute in screen space. */
export function toSvgPoints(points: number[], t: CardTransform): string {
  const out: string[] = [];
  for (let i = 0; i < points.length; i += 2) {
    out.push(`${t.x + points[i] * t.scale},${t.y + points[i + 1] * t.scale}`);
  }
  return out.join(" ");
}

export function rectToSvgPoints(
  rect: AnnotationRect,
  t: CardTransform,
): string {
  const { x, y, width, height } = rect;
  return toSvgPoints(
    [x, y, x + width, y, x + width, y + height, x, y + height],
    t,
  );
}

/** Ray-casting hit test. Points are a flat [x0, y0, …] polygon. */
export function pointInPolygon(
  x: number,
  y: number,
  points: number[],
): boolean {
  let inside = false;
  const n = points.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = points[i * 2];
    const yi = points[i * 2 + 1];
    const xj = points[j * 2];
    const yj = points[j * 2 + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Polygon helpers for hand-authoring stand-in segments. */
export function ellipsePoly(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  steps = 28,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    out.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  return out;
}

export function rectPoly(
  x: number,
  y: number,
  w: number,
  h: number,
): number[] {
  return [x, y, x + w, y, x + w, y + h, x, y + h];
}
