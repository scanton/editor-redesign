"use client";

import { motion } from "motion/react";
import { ImagePlus, Smile } from "lucide-react";
import { useState } from "react";
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
import { staggerParent } from "@/lib/motion";
import { CARD_FONTS, RECOMMENDED_COLORS, fontCssVar } from "@/lib/fonts";
import type { TextNode } from "@/lib/types";
import { useEditorStore, useNode } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "write", label: "Write" },
  { value: "upload", label: "Upload" },
  { value: "emoji", label: "Emoji" },
];

const SIZES = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
];

const SIZE_PX: Record<string, number> = { S: 44, M: 58, L: 74, XL: 92 };

const ALIGNS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const FONT_OPTIONS = CARD_FONTS.map((f) => ({
  value: f.id,
  label: f.label,
  sample: "Font Sample",
  fontFamily: f.cssVar,
}));

export function MessagePanel() {
  const [tab, setTab] = useState("write");
  const [dirty, setDirty] = useState(false);

  const message = useNode<TextNode>("inside_message");
  const closing = useNode<TextNode>("inside_closing");
  const updateNode = useEditorStore((s) => s.updateNode);
  const setFace = useEditorStore((s) => s.setFace);

  if (!message || !closing) return null;

  const patch = (id: string, p: Partial<TextNode>) => {
    setDirty(true);
    updateNode(id, p);
  };

  /** Message and closing share type treatment, the way the real editor does. */
  const patchBoth = (p: Partial<TextNode>) => {
    patch(message.id, p);
    patch(closing.id, p);
  };

  const currentSize =
    Object.entries(SIZE_PX).find(([, px]) => px === message.fontSize)?.[0] ?? "M";

  /** Editing the inside should show the inside. */
  const focusInside = () => setFace("inside");

  return (
    <>
      <PanelBody>
        <motion.div variants={staggerParent} initial="hidden" animate="visible">
          <Section>
            <Segmented id="message" options={TABS} value={tab} onChange={setTab} />
          </Section>

          {tab === "write" && (
            <>
              <Section title="Font">
                <Select
                  options={FONT_OPTIONS}
                  value={message.fontFamily}
                  onChange={(fontFamily) => patchBoth({ fontFamily })}
                />
              </Section>

              <Section>
                <div className="flex items-end gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2.5 text-[15px] font-bold text-ink">Size</h3>
                    <Select
                      options={SIZES}
                      value={currentSize}
                      onChange={(size) => patchBoth({ fontSize: SIZE_PX[size] })}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2.5 text-[15px] font-bold text-ink">Align</h3>
                    <Select
                      options={ALIGNS}
                      value={message.align}
                      onChange={(align) =>
                        patchBoth({ align: align as TextNode["align"] })
                      }
                    />
                  </div>
                  <div>
                    <h3 className="mb-2.5 text-[15px] font-bold text-ink">Color</h3>
                    <ColorWheelButton color={message.fill} />
                  </div>
                </div>
              </Section>

              <Section title="Message">
                <textarea
                  value={message.text}
                  rows={5}
                  onFocus={focusInside}
                  onChange={(e) => patch(message.id, { text: e.target.value })}
                  placeholder="Write your message..."
                  style={{ fontFamily: fontCssVar(message.fontFamily) }}
                  className={cn(inputClass, "resize-none text-[17px] leading-relaxed")}
                />
              </Section>

              <Section title="Closing">
                <input
                  value={closing.text}
                  onFocus={focusInside}
                  onChange={(e) => patch(closing.id, { text: e.target.value })}
                  placeholder="Closing (e.g. Lots of love)"
                  style={{ fontFamily: fontCssVar(closing.fontFamily) }}
                  className={cn(inputClass, "text-[17px]")}
                />
              </Section>

              <Section title="Recommended colors">
                <SwatchGrid
                  colors={RECOMMENDED_COLORS}
                  value={message.fill}
                  onChange={(fill) => patchBoth({ fill })}
                />
              </Section>
            </>
          )}

          {tab === "upload" && (
            <Section>
              <StubCard
                icon={<ImagePlus size={16} />}
                title="Upload a written note"
                note="Stub — photograph a handwritten message and drop it in as art."
              />
            </Section>
          )}

          {tab === "emoji" && (
            <Section>
              <StubCard
                icon={<Smile size={16} />}
                title="Emoji picker"
                note="Stub — inserts emoji into the message at the caret."
              />
            </Section>
          )}
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <PrimaryButton
          disabled={!dirty}
          onClick={() => {
            useEditorStore.getState().commit();
            setDirty(false);
          }}
        >
          Save
        </PrimaryButton>
      </PanelFooter>
    </>
  );
}
