"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BrushLayer } from "@/components/canvas/brush-layer";
import { RegionLayer } from "@/components/canvas/region-layer";
import { CanvasTools } from "@/components/canvas/canvas-tools";
import { EnvelopePreview } from "@/components/canvas/envelope-preview";
import { SceneLayer } from "@/components/canvas/scene-layer";
import { PlacementLayers } from "@/components/canvas/placement-layers";
import { QrLayer } from "@/components/canvas/qr-layer";
import { RenderPill } from "@/components/canvas/render-pill";
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
  const canvasMode = useEditorStore((s) => s.canvasMode);
  // The face switcher decides what the canvas shows; the envelope is a face of
  // the digital card, not a takeover.
  const showEnvelope = useEditorStore((s) => s.surface === "envelope");
  // A digital card is never shown on editor grey — it ships inside a scene.
  const showScene = useEditorStore(
    (s) => s.cardType === "digital" && s.surface === "card",
  );
  const setViewport = useEditorStore((s) => s.setViewport);
  // Finish is checkout — nothing on the card is editable from there.
  const editing = useEditorStore((s) => s.step !== 3);
  // The code is grabbable while the panel that owns it is open, and only on
  // the panel it is printed on.
  const showQrHandles = useEditorStore(
    (s) =>
      s.product === "invitation" &&
      s.activeTool === "event" &&
      s.invitation.qrOn &&
      s.invitation.rsvpOn &&
      s.surface === "card" &&
      s.face === "back" &&
      s.canvasMode === "element",
  );

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
        {showScene && <SceneLayer />}

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

        {/* Placement boxes for whichever panel owns a placeable piece. */}
        {!showEnvelope && size.width > 0 && <PlacementLayers viewport={size} />}

        {showQrHandles && size.width > 0 && <QrLayer viewport={size} />}

        <RenderPill />

        {/* Marking up regions is a card operation — no meaning on the envelope. */}
        {!showEnvelope && size.width > 0 && <RegionLayer viewport={size} />}
        {/* Keyed by mode so switching brushes starts clean rather than
            carrying the last instruction across. */}
        {!showEnvelope && size.width > 0 && (
          <BrushLayer key={canvasMode} viewport={size} />
        )}
      </div>

      <AnimatePresence>
        {/* No marking up an envelope — but the switcher has to stay, or the
            envelope face becomes a room with no door back to the card. */}
        {editing && !showEnvelope && <CanvasTools key="tools" />}
      </AnimatePresence>
      <FaceSwitcher />
    </div>
  );
}
