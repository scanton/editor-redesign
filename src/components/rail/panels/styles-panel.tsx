"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  inputClass,
} from "@/components/rail/panels/parts";
import { IconButton } from "@/components/ui/icon-button";
import { springBouncy, staggerParent } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Real thumbnails are rendered art we're not shipping in the demo, so each
 * style gets a generated stand-in: a gradient plus a motif drawn in CSS.
 */
type StyleDef = {
  id: string;
  label: string;
  gradient: string;
  motif: string;
};

const STYLES: StyleDef[] = [
  { id: "classic", label: "Classic", gradient: "#2c1d10, #6b4a24", motif: "🕯️" },
  { id: "modern", label: "Modern", gradient: "#b23a2e, #d9c9a8", motif: "◧" },
  { id: "minimalist", label: "Minimalist", gradient: "#faf8f4, #ebe7df", motif: "△" },
  { id: "illustrated", label: "Illustrated", gradient: "#3d5a2c, #c9a227", motif: "🍄" },
  { id: "photo", label: "Photo", gradient: "#8fb8e0, #e8d5c0", motif: "🌊" },
  { id: "floral", label: "Floral", gradient: "#5a1f22, #2f4033", motif: "❀" },
  { id: "bold", label: "Bold / Graphic", gradient: "#12043a, #ff2d95", motif: "◤" },
  { id: "hand-drawn", label: "Hand-drawn", gradient: "#ffffff, #e9e9ea", motif: "✎" },
  { id: "cute", label: "Cute / Whimsical", gradient: "#a8dba8, #ffd9e8", motif: "🦊" },
  { id: "vintage", label: "Vintage", gradient: "#7a3b2e, #e0b96a", motif: "🎞️" },
  { id: "meme", label: "Meme", gradient: "#ff5f1f, #ffe600", motif: "🔥" },
  { id: "comic", label: "Comic Book", gradient: "#1f3fd8, #ffd23f", motif: "★" },
];

export function StylesPanel() {
  const selected = useEditorStore((s) => s.selectedStyles);
  const toggleStyle = useEditorStore((s) => s.toggleStyle);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? STYLES.filter((s) => s.label.toLowerCase().includes(q)) : STYLES;
  }, [query]);

  return (
    <>
      <PanelBody>
        <motion.div variants={staggerParent} initial="hidden" animate="visible">
          <Section
            title="Select styles"
            action={
              <IconButton
                aria-label={searching ? "Close search" : "Search styles"}
                className="-mr-1 h-8 w-8"
                onClick={() => {
                  setSearching((s) => !s);
                  setQuery("");
                }}
              >
                {searching ? <X size={16} /> : <Search size={17} />}
              </IconButton>
            }
          >
            <AnimatePresence initial={false}>
              {searching && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={springBouncy}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search styles"
                    className={cn(inputClass, "mb-3")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-3">
              {visible.map((style, i) => {
                const isOn = selected.includes(style.id);
                return (
                  <motion.button
                    key={style.id}
                    type="button"
                    layout
                    onClick={() => toggleStyle(style.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springBouncy, delay: 0.02 * i }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    className="group text-left"
                  >
                    <span
                      className={cn(
                        "relative flex aspect-square items-center justify-center overflow-hidden rounded-[10px] text-[34px] ring-2 transition-shadow",
                        isOn
                          ? "shadow-rail ring-ink"
                          : "ring-transparent group-hover:ring-hairline-strong",
                      )}
                      style={{
                        backgroundImage: `linear-gradient(140deg, ${style.gradient})`,
                      }}
                    >
                      <span className="opacity-90 drop-shadow">{style.motif}</span>
                      <AnimatePresence>
                        {isOn && (
                          <motion.span
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={springBouncy}
                            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
                          >
                            <Check size={12} strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block text-center text-[12.5px] leading-tight",
                        isOn ? "font-semibold text-ink" : "text-ink-soft",
                      )}
                    >
                      {style.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {visible.length === 0 && (
              <p className="py-6 text-center text-[13px] text-ink-faint">
                No styles match “{query}”.
              </p>
            )}
          </Section>
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <PrimaryButton disabled={selected.length === 0}>Update card</PrimaryButton>
        <p className="mt-2 text-center text-[11.5px] text-ink-faint">
          Stub — would re-render all three faces in the selected styles.
        </p>
      </PanelFooter>
    </>
  );
}
