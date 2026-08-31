"use client";

import type { CSSProperties } from "react";
import type { Palette } from "@/lib/gradient-palettes";

/**
 * Renders one of the ten gradient scenes. Ported from the gradient-backgrounds
 * repo — the layer markup lives here, the visual definitions in gradients.css.
 */
const LAYERS: Record<string, string[]> = {
  aurora: ["blob l1", "blob l2", "blob l3"],
  mesh: ["blob l1", "blob l2", "blob l3", "blob l4"],
  silk: ["sq l1", "sq l2"],
  halo: ["sq l1", "blob l2"],
  tide: ["blob l1", "blob l2", "blob l3"],
  dawn: ["blob l1", "blob l2"],
  lumen: ["blob l1", "blob l2", "blob l3"],
  prism: ["sq l1", "sq l2"],
  nebula: ["blob l1", "blob l2", "blob l3", "blob l4", "blob l5"],
  ripple: ["sq l1", "sq l2", "blob l3"],
};

export function GradientBackground({
  styleId,
  palette,
  maxDimension,
  speed = 12,
}: {
  styleId: string;
  palette: Palette;
  /** Larger of the container's two dimensions, so shapes stay round. */
  maxDimension: number;
  /** 0–100; 0 pauses, higher is faster with larger movement. */
  speed?: number;
}) {
  const [c1, c2, c3, c4, c5] = palette.colors;
  const speedFactor = 0.3 + 11.7 * (speed / 100);

  const vars = {
    "--c1": c1,
    "--c2": c2,
    "--c3": c3,
    "--c4": c4,
    "--c5": c5,
    "--maxd": `${maxDimension}px`,
    "--dur": 1 / speedFactor,
    "--amp": 1 + 0.7 * (speed / 100),
  } as CSSProperties;

  return (
    <div
      className={`gbg g-${styleId}${speed === 0 ? " paused" : ""}`}
      style={vars}
      aria-hidden
    >
      {(LAYERS[styleId] ?? []).map((cls) => (
        <div key={cls} className={cls} />
      ))}
    </div>
  );
}
