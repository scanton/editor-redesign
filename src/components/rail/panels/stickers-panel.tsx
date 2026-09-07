"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Info, Loader2, Sparkles, Trash2, Upload, Wand2 } from "lucide-react";
import { PanelBody, Section, inputClass } from "@/components/rail/panels/parts";
import { Tooltip } from "@/components/ui/tooltip";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import { STICKER_GROUPS, UPLOAD_SPEC } from "@/lib/stickers";
import { useEditorStore } from "@/store/editor-store";
import type { StickerNode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A shelf of stickers and a way to ask for one that isn't on it.
 *
 * Its own tool rather than a tab inside Message: a sticker is not a word, and
 * it is the part of a card people fiddle with after the words are done. The
 * shelf is placeholder glyphs until the real library exists — everything
 * around them (placing, moving, resizing) is what needed proving.
 */
export function StickersPanel() {
  const addSticker = useEditorStore((s) => s.addSticker);
  // Select the node list, not a derived one: a selector that builds a new
  // array on every read is a new snapshot every read, and the store will spin.
  const nodes = useEditorStore((s) => s.doc.faces[s.face].nodes);
  const placed = nodes.filter((n) => n.kind === "sticker") as StickerNode[];
  const faceLabel = useEditorStore((s) => s.doc.faces[s.face].label);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <p className="text-[12.5px] leading-snug text-ink-faint">
            Stickers sit on top of the finished artwork, so they can be moved
            and resized freely — nothing is re-rendered to place one. They land
            on the {faceLabel.toLowerCase()}.
          </p>
        </Section>

        <BringYourOwn />
        <MakeOne />

        {placed.length > 0 && <Placed stickers={placed} />}

        {STICKER_GROUPS.map((group) => (
          <Section key={group.label} title={group.label}>
            <div className="grid grid-cols-4 gap-2">
              {group.stickers.map((sticker) => (
                <motion.button
                  key={sticker.id}
                  type="button"
                  title={sticker.label}
                  aria-label={`Add ${sticker.label}`}
                  onClick={() => addSticker(sticker.id)}
                  whileHover={{ scale: 1.1, y: -3, rotate: -6 }}
                  whileTap={{ scale: 0.92 }}
                  transition={springBouncy}
                  className="flex aspect-square items-center justify-center rounded-[13px] border border-hairline bg-surface text-[26px] leading-none hover:border-hairline-strong hover:bg-surface-sunken"
                >
                  <span aria-hidden>{sticker.glyph}</span>
                </motion.button>
              ))}
            </div>
          </Section>
        ))}
      </motion.div>
    </PanelBody>
  );
}

/**
 * A sticker of their own. The spec is offered before the file picker rather
 * than as an error afterwards — the failure people actually hit is a PNG with
 * no transparency, which only shows up once it is on the card.
 */
function BringYourOwn() {
  const addUploaded = useEditorStore((s) => s.addUploadedSticker);
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const take = (file: File | undefined) => {
    if (!file) return;
    if (file.size > UPLOAD_SPEC.maxBytes) {
      setProblem("That one is over 5 MB. Try a smaller export.");
      return;
    }
    if (!UPLOAD_SPEC.accept.includes(file.type)) {
      setProblem("PNG or WebP, so the background can be see-through.");
      return;
    }
    setProblem(null);
    const reader = new FileReader();
    reader.onload = () =>
      addUploaded(String(reader.result), file.name.replace(/\.[^.]+$/, ""));
    reader.readAsDataURL(file);
  };

  return (
    <Section
      title="Bring your own"
      action={
        <Tooltip label={UPLOAD_SPEC.hint} side="left">
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-surface-sunken hover:text-ink">
            <Info size={14} />
          </span>
        </Tooltip>
      }
    >
      <input
        ref={input}
        type="file"
        accept={UPLOAD_SPEC.accept}
        className="hidden"
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <motion.button
        type="button"
        onClick={() => input.current?.click()}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        transition={springTight}
        className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-dashed border-hairline-strong py-3 text-[13px] font-semibold text-ink hover:bg-surface-sunken"
      >
        <Upload size={15} className="text-ink-soft" />
        Upload a sticker
      </motion.button>
      <p
        className={cn(
          "mt-2 text-[12px] leading-snug",
          problem ? "text-brand-red" : "text-ink-faint",
        )}
      >
        {problem ?? UPLOAD_SPEC.hint}
      </p>
    </Section>
  );
}

/**
 * Ask for one that isn't on the shelf.
 *
 * Stubbed — a stand-in glyph fills in for the drawing. That is a note for us,
 * not for the customer: the line under the field is the one place to tell them
 * this is here at all, so it says what the feature does.
 */
function MakeOne() {
  const prompt = useEditorStore((s) => s.stickerPrompt);
  const setPrompt = useEditorStore((s) => s.setStickerPrompt);
  const making = useEditorStore((s) => s.makingSticker);
  const make = useEditorStore((s) => s.makeSticker);
  const ready = prompt.trim().length > 0 && !making;

  return (
    <Section title="Create your own">
      <div className="flex items-center gap-2">
        <input
          value={prompt}
          disabled={making}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && make()}
          placeholder="A cat in a mortarboard"
          className={cn(inputClass, "min-w-0 flex-1")}
        />
        <motion.button
          type="button"
          onClick={make}
          disabled={!ready}
          aria-label="Make this sticker"
          whileHover={ready ? { scale: 1.06, rotate: -8 } : undefined}
          whileTap={ready ? { scale: 0.94 } : undefined}
          transition={springTight}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white shadow-rail transition-opacity disabled:opacity-35"
        >
          {making ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Wand2 size={17} />
          )}
        </motion.button>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-ink-faint">
        <Sparkles size={12} className="mt-[3px] shrink-0" />
        <span>
          {making
            ? "Stampy is drawing it…"
            : "Not on the shelf? Describe it and Stampy will draw it — then place it like any other sticker."}
        </span>
      </p>
    </Section>
  );
}

/** What is already on this face, so one can be picked to move or thrown away. */
function Placed({ stickers }: { stickers: StickerNode[] }) {
  const selected = useEditorStore((s) => s.selectedSticker);
  const select = useEditorStore((s) => s.setSelectedSticker);
  const removeNode = useEditorStore((s) => s.removeNode);

  return (
    <Section title="On this face">
      <div className="flex flex-col gap-1.5">
        {stickers.map((sticker) => {
          const on = selected === sticker.id;
          return (
            <div
              key={sticker.id}
              className={cn(
                "flex items-center gap-2 rounded-[12px] border px-2 py-1.5 transition-colors",
                on ? "border-brand-red bg-brand-red/5" : "border-hairline",
              )}
            >
              <button
                type="button"
                onClick={() => select(on ? null : sticker.id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <span aria-hidden className="text-[22px] leading-none">
                  {sticker.glyph}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {sticker.label}
                  </span>
                  <span className="block text-[11.5px] text-ink-faint">
                    {on ? "Drag it on the card" : "Tap to place it"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${sticker.label}`}
                onClick={() => removeNode(sticker.id)}
                className="shrink-0 rounded-full p-1.5 text-ink-faint hover:text-brand-red"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
