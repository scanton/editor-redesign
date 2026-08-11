"use client";

import { motion } from "motion/react";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { SignaturePad } from "@/components/rail/panels/signature-pad";
import {
  ColorWheelButton,
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  Segmented,
  Select,
  StubCard,
  SwatchGrid,
  inputClass,
} from "@/components/rail/panels/parts";
import { springBouncy, staggerParent, staggerChild } from "@/lib/motion";
import { CARD_FONTS, RECOMMENDED_COLORS, fontCssVar } from "@/lib/fonts";
import type { DrawNode, Stroke } from "@/lib/types";
import { useEditorStore, useNode } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const MODE_TABS = [
  { value: "create", label: "Create" },
  { value: "library", label: "Library" },
];

const CREATE_TABS = [
  { value: "draw", label: "Draw" },
  { value: "upload", label: "Upload" },
  { value: "type", label: "Type" },
];

const THICKNESSES = [2, 4, 7, 11];

const FONT_OPTIONS = CARD_FONTS.map((f) => ({
  value: f.id,
  label: f.label,
  sample: "Sample",
  fontFamily: f.cssVar,
}));

/** Signatures are captured small and placed large — keep the aspect ratio. */
const PLACED_WIDTH = 460;

export function SignaturePanel() {
  const [mode, setMode] = useState("create");
  const [tab, setTab] = useState("draw");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState("#16161a");
  const [thickness, setThickness] = useState(THICKNESSES[0]);
  const [typed, setTyped] = useState("");
  const [typedFont, setTypedFont] = useState("Caveat");
  const [padSize, setPadSize] = useState({ width: 432, height: 160 });
  const onMeasure = useCallback(
    (size: { width: number; height: number }) => setPadSize(size),
    [],
  );

  const signature = useNode<DrawNode>("inside_signature");
  const updateNode = useEditorStore((s) => s.updateNode);
  const setFace = useEditorStore((s) => s.setFace);

  if (!signature) return null;

  const canSave = tab === "draw" ? strokes.length > 0 : typed.trim().length > 0;

  const save = () => {
    const { width: sourceWidth, height: sourceHeight } = padSize;
    updateNode(
      signature.id,
      tab === "draw"
        ? {
            strokes,
            typed: undefined,
            sourceWidth,
            sourceHeight,
            width: PLACED_WIDTH,
            height: (PLACED_WIDTH * sourceHeight) / sourceWidth,
          }
        : {
            strokes: [],
            typed: { text: typed, fontFamily: typedFont, fill: color },
            sourceWidth,
            sourceHeight,
            width: PLACED_WIDTH,
            height: (PLACED_WIDTH * sourceHeight) / sourceWidth,
          },
      true,
    );
    setFace("inside");
  };

  return (
    <>
      <PanelBody>
        <motion.div variants={staggerParent} initial="hidden" animate="visible">
          <Section>
            <Segmented
              id="signature-mode"
              options={MODE_TABS}
              value={mode}
              onChange={setMode}
            />
          </Section>

          {mode === "library" ? (
            <Section>
              <StubCard
                title="No saved signatures yet"
                note="Stub — signatures you save are reusable across every card."
              />
            </Section>
          ) : (
            <>
              <Section>
                <Segmented
                  id="signature-create"
                  options={CREATE_TABS}
                  value={tab}
                  onChange={setTab}
                />
              </Section>

              {tab === "draw" && (
                <>
                  <Section>
                    <SignaturePad
                      strokes={strokes}
                      onChange={setStrokes}
                      color={color}
                      thickness={thickness}
                      onMeasure={onMeasure}
                    />
                    <p className="mt-2.5 text-[14px] text-ink-faint">
                      Use your mouse to draw your signature.
                    </p>
                  </Section>

                  <Section title="Thickness">
                    <div className="flex gap-3">
                      {THICKNESSES.map((t) => (
                        <motion.button
                          key={t}
                          type="button"
                          aria-label={`${t}px`}
                          onClick={() => setThickness(t)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={springBouncy}
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                            thickness === t
                              ? "border-ink bg-surface-sunken"
                              : "border-hairline hover:border-hairline-strong",
                          )}
                        >
                          <span
                            className="block rounded-full bg-ink"
                            style={{ width: t + 3, height: t + 3 }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {tab === "upload" && (
                <Section>
                  <StubCard
                    icon={<Upload size={16} />}
                    title="Upload a scan"
                    note="Stub — background-removes a photographed signature."
                  />
                </Section>
              )}

              {tab === "type" && (
                <>
                  <Section title="Your name">
                    <input
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      placeholder="Mom & Dad"
                      style={{ fontFamily: fontCssVar(typedFont) }}
                      className={cn(inputClass, "text-[22px]")}
                    />
                  </Section>
                  <Section title="Handwriting">
                    <Select
                      options={FONT_OPTIONS}
                      value={typedFont}
                      onChange={setTypedFont}
                    />
                  </Section>
                </>
              )}

              {tab !== "upload" && (
                <>
                  <Section title="Color">
                    <ColorWheelButton color={color} />
                  </Section>

                  <Section title="Recommended colors">
                    <SwatchGrid
                      colors={RECOMMENDED_COLORS}
                      value={color}
                      onChange={(next) => {
                        setColor(next);
                        setStrokes((s) => s.map((k) => ({ ...k, color: next })));
                      }}
                    />
                  </Section>
                </>
              )}
            </>
          )}
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <motion.div variants={staggerChild}>
          <PrimaryButton disabled={mode === "library" || !canSave} onClick={save}>
            Save
          </PrimaryButton>
        </motion.div>
      </PanelFooter>
    </>
  );
}
