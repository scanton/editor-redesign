import type { Transition, Variants } from "motion/react";

/**
 * Shared motion vocabulary for the editor.
 *
 * The editor is a consumer product — everything that moves should feel like it
 * has weight and a little bit of personality. Panels don't fade, they arrive.
 */

/** Default for most layout movement: quick, lands with a soft bump. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

/** Pop-outs and things that should visibly overshoot. */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 22,
  mass: 0.9,
};

/** Big surfaces (flyouts, drawers) — heavier, still bouncy. */
export const springHeavy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 1.1,
};

/** Micro-interactions: hovers, icon nudges, chip toggles. */
export const springTight: Transition = {
  type: "spring",
  stiffness: 700,
  damping: 34,
  mass: 0.5,
};

export const easeOutSoft: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

/**
 * Robert Penner's easeOutBounce. Four decaying parabolic arcs — the value
 * arrives at its target, rebounds off it, and settles. Unlike a spring it never
 * overshoots past the target, so a panel bounces *against* its resting edge
 * rather than sailing through it.
 */
export function easeOutBounce(t: number): number {
  const n = 7.5625;
  const d = 2.75;

  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) {
    t -= 1.5 / d;
    return n * t * t + 0.75;
  }
  if (t < 2.5 / d) {
    t -= 2.25 / d;
    return n * t * t + 0.9375;
  }
  t -= 2.625 / d;
  return n * t * t + 0.984375;
}

/** Needs a longer duration than a spring — all four bounces have to read. */
export const bounceOut: Transition = { duration: 0.72, ease: easeOutBounce };

/** Retracting a panel is quick and unbouncy — bouncing on the way out fights the click. */
export const flyoutClose: Transition = {
  duration: 0.22,
  ease: [0.5, 0, 0.9, 0.4],
};

/** Children of a flyout cascade in behind the panel. */
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
  exit: {},
};

export const staggerChild: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: springBouncy },
  exit: { y: 6, opacity: 0, transition: { duration: 0.1 } },
};

/** Standard press feedback for anything clickable. */
export const pressable = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.94 },
  transition: springTight,
} as const;
