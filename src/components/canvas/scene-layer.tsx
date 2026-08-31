"use client";

import { motion } from "motion/react";
import { findBackground } from "@/lib/digital-card";
import { useEditorStore } from "@/store/editor-store";

/**
 * The scene a digital card sits in. It lives behind the artwork rather than in
 * it, which is why switching is instant — nothing is re-rendered.
 *
 * The real scenes are 3D and video; this is a moving stand-in so the card is
 * never shown floating on a flat editor grey when it will not ship that way.
 */
export function SceneLayer() {
  const background = useEditorStore((s) => s.digital.background);
  const scene = findBackground(background);

  return (
    <motion.div
      key={scene.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(145deg, ${scene.gradient})` }}
      />
      {/* Slow drift so a "3D Animation" scene doesn't read as a flat fill. */}
      <motion.div
        className="absolute -inset-1/4 opacity-55 mix-blend-soft-light"
        style={{
          backgroundImage: `radial-gradient(closest-side, rgb(255 255 255 / 0.85), transparent 70%),
            radial-gradient(closest-side, rgb(255 255 255 / 0.5), transparent 70%)`,
          backgroundSize: "55% 55%, 40% 40%",
          backgroundPosition: "20% 30%, 75% 65%",
          backgroundRepeat: "no-repeat",
        }}
        animate={{ x: ["-3%", "3%", "-3%"], y: ["2%", "-2%", "2%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Top-right: the toolbar owns top-centre and the face switcher the bottom. */}
      <span className="absolute right-4 top-5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
        {scene.label} · {scene.kind}
      </span>
    </motion.div>
  );
}
