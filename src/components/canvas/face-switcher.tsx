"use client";

import { motion } from "motion/react";
import { springBouncy, springTight } from "@/lib/motion";
import type { FaceId } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/** A greeting card folds; an invitation is two panels with nothing between. */
const CARD_FACES: FaceId[] = ["front", "inside", "back"];
const INVITATION_FACES: FaceId[] = ["front", "back"];

/** A face's thumbnail is its artwork, falling back to its flat colour. */
function artworkOf(face: { nodes: { kind: string; src?: string }[] }) {
  return face.nodes.find((n) => n.kind === "image")?.src ?? null;
}

export function FaceSwitcher() {
  const doc = useEditorStore((s) => s.doc);
  const face = useEditorStore((s) => s.face);
  const setFace = useEditorStore((s) => s.setFace);
  const surface = useEditorStore((s) => s.surface);
  const setSurface = useEditorStore((s) => s.setSurface);
  const envelopeColour = useEditorStore((s) => s.digital.envelopeColour);
  const order = useEditorStore((s) =>
    s.product === "invitation" ? INVITATION_FACES : CARD_FACES,
  );
  // Only the digital card has an envelope you can look at before it opens.
  const hasEnvelopeFace = useEditorStore((s) => s.cardType === "digital");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-5">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0, transition: { duration: 0.16 } }}
        transition={{ ...springBouncy, delay: 0.15 }}
        className="pointer-events-auto flex items-end gap-3 rounded-[20px] border border-hairline bg-surface/85 px-3 py-2.5 shadow-rail backdrop-blur"
      >
        {order.map((id) => {
          const f = doc.faces[id];
          const isActive = surface === "card" && face === id;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => {
                setSurface("card");
                setFace(id);
              }}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTight}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "text-[11px] font-semibold transition-colors",
                  isActive ? "text-ink" : "text-ink-faint",
                )}
              >
                {f.label}
              </span>
              <span className="relative block">
                <span
                  className={cn(
                    "block h-[62px] overflow-hidden rounded-[7px] ring-1 ring-black/10 transition-shadow",
                    isActive && "shadow-rail",
                  )}
                  style={{
                    // Thumbnails carry each face's real proportions, so the
                    // inside reads as the wide spread it is.
                    width: (62 * f.width) / f.height,
                    backgroundColor: f.background,
                    backgroundImage: artworkOf(f)
                      ? `url(${artworkOf(f)})`
                      : f.backgroundAccent
                        ? `linear-gradient(180deg, ${f.background}, ${f.backgroundAccent})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {isActive && (
                  <motion.span
                    layoutId="face-active-ring"
                    transition={springBouncy}
                    className="pointer-events-none absolute -inset-[3px] rounded-[10px] ring-2 ring-brand-red"
                  />
                )}
              </span>
            </motion.button>
          );
        })}

        {hasEnvelopeFace && (
          <motion.button
            type="button"
            onClick={() => setSurface("envelope")}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTight}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "text-[11px] font-semibold transition-colors",
                surface === "envelope" ? "text-ink" : "text-ink-faint",
              )}
            >
              Envelope
            </span>
            <span className="relative block">
              <span
                className={cn(
                  "block h-[62px] w-[74px] overflow-hidden rounded-[7px] ring-1 ring-black/10 transition-shadow",
                  surface === "envelope" && "shadow-rail",
                )}
                style={{ backgroundColor: envelopeColour }}
              >
                <svg viewBox="0 0 74 62" className="h-full w-full">
                  <path
                    d="M0 0 L37 30 L74 0"
                    fill="none"
                    stroke="rgb(0 0 0 / 0.22)"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              {surface === "envelope" && (
                <motion.span
                  layoutId="face-active-ring"
                  transition={springBouncy}
                  className="pointer-events-none absolute -inset-[3px] rounded-[10px] ring-2 ring-brand-red"
                />
              )}
            </span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
