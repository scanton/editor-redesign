"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { EraserLayer } from "@/components/canvas/eraser-layer";
import { RegionLayer } from "@/components/canvas/region-layer";
import { CanvasTools } from "@/components/canvas/canvas-tools";
import { EnvelopePreview } from "@/components/canvas/envelope-preview";
import { PlacementLayer } from "@/components/canvas/placement-layer";
import { FaceSwitcher } from "@/components/canvas/face-switcher";
import { springHeavy } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";

const CardStage = dynamic(() => import("@/components/canvas/card-stage"), {
  ssr: false,
});

export function CanvasArea() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const face = useEditorStore((s) => s.face);
  // The Envelope tool takes over the canvas — you're addressing the envelope,
  // not editing the card.
  const showEnvelope = useEditorStore((s) => s.activeTool === "envelope");
  // Marking up the card takes the pointer, so the two never overlap.
  const placing = useEditorStore(
    (s) => s.activeTool === "longform" && s.canvasMode === "select",
  );
  const setViewport = useEditorStore((s) => s.setViewport);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
      setViewport({ width, height });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [setViewport]);

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <div
        ref={hostRef}
        className="canvas-backdrop relative min-h-0 flex-1 overflow-hidden"
        style={{ perspective: 2000 }}
      >
        {size.width > 0 && (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={showEnvelope ? "envelope" : face}
              initial={{ opacity: 0, rotateY: 18, scale: 0.94 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -14, scale: 0.96 }}
              transition={springHeavy}
              className="absolute inset-0"
            >
              {showEnvelope ? (
                <EnvelopePreview />
              ) : (
                <CardStage width={size.width} height={size.height} />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Placement box for the long-form block, while that panel is open. */}
        {!showEnvelope && size.width > 0 && placing && (
          <PlacementLayer viewport={size} />
        )}

        {/* Marking up regions is a card operation — no meaning on the envelope. */}
        {!showEnvelope && size.width > 0 && <RegionLayer viewport={size} />}
        {!showEnvelope && size.width > 0 && <EraserLayer viewport={size} />}
      </div>

      <AnimatePresence>
        {!showEnvelope && <CanvasTools key="tools" />}
        {!showEnvelope && <FaceSwitcher key="faces" />}
      </AnimatePresence>
    </div>
  );
}
