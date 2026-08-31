"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GradientBackground } from "@/components/canvas/gradient-background";
import {
  describeScene,
  findAssetScene,
} from "@/lib/digital-card";
import { PALETTES } from "@/lib/gradient-palettes";
import { THEMES, themeTint } from "@/lib/themes";
import { useEditorStore } from "@/store/editor-store";

/**
 * The scene a digital card sits in. It lives behind the artwork rather than in
 * it, which is why switching is instant — nothing is re-rendered.
 *
 * Gradient scenes are the real thing, ported from the gradient-backgrounds
 * repo. Themes and video are stand-ins until their engines are embedded.
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
      {scene.kind === "Gradient" ? (
        <GradientBackground
          styleId={scene.styleId}
          palette={
            PALETTES.find((p) => p.id === scene.paletteId) ?? PALETTES[0]
          }
          maxDimension={maxDimension}
        />
      ) : (
        <motion.div
          key={describeScene(scene)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          style={{
            backgroundImage:
              scene.kind === "3D Animation"
                ? themeTint(
                    THEMES.find((t) => t.id === scene.themeId) ?? THEMES[0],
                  )
                : `linear-gradient(145deg, ${findAssetScene(scene.id).gradient})`,
          }}
        />
      )}

      {/* Top-right: the toolbar owns top-centre and the face switcher the bottom. */}
      <span className="absolute right-4 top-5 max-w-[40%] truncate rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
        {describeScene(scene)}
      </span>
    </div>
  );
}
