"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { GradientBackground } from "@/components/canvas/gradient-background";
import { describeScene, findAssetScene } from "@/lib/digital-card";
import { PALETTES } from "@/lib/gradient-palettes";
import { useEditorStore } from "@/store/editor-store";

// WebGL and Canvas 2D — client only, and only fetched when a theme is showing.
const ThemeScene = dynamic(
  () => import("@/components/canvas/theme-scene").then((m) => m.ThemeScene),
  { ssr: false },
);

/**
 * The scene a digital card sits in. It lives behind the artwork rather than in
 * it, which is why switching is instant — nothing about the card is re-rendered.
 *
 * Gradient and animated scenes are the real renderers. Video and stills are
 * stand-ins until those assets are wired up.
 */
export function SceneLayer() {
  const scene = useEditorStore((s) => s.digital.scene);
  const hostRef = useRef<HTMLDivElement>(null);
  const [maxDimension, setMaxDimension] = useState(1200);

  // Gradient shapes are sized from the container's larger dimension so they
  // stay round whatever shape the canvas is.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setMaxDimension(Math.max(width, height));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {scene.kind === "Gradient" && (
        <GradientBackground
          styleId={scene.styleId}
          palette={PALETTES.find((p) => p.id === scene.paletteId) ?? PALETTES[0]}
          maxDimension={maxDimension}
          speed={scene.speed}
        />
      )}

      {scene.kind === "3D Animation" && (
        <ThemeScene
          themeId={scene.themeId}
          effectId={scene.effectId}
          speed={scene.speed}
        />
      )}

      {(scene.kind === "Video BG" || scene.kind === "Stills") && (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(145deg, ${findAssetScene(scene.id).gradient})`,
          }}
        />
      )}

      {/* Top-right: the toolbar owns top-centre and the face switcher the bottom. */}
      <span className="absolute right-4 top-5 z-20 max-w-[40%] truncate rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
        {describeScene(scene)}
      </span>
    </div>
  );
}
