"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  inputClass,
} from "@/components/rail/panels/parts";
import { IconButton } from "@/components/ui/icon-button";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import {
  POPULAR_STYLE_IDS,
  STYLE_GROUPS,
  TOTAL_STYLES,
  findStyle,
} from "@/lib/art-styles";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * The production style library — 23 groups, 268 styles. Thumbnails come from the
 * style service; until we have them each tile carries the style's name, which is
 * what customers actually browse by.
 */
export function StylesPanel() {
  const selected = useEditorStore((s) => s.selectedStyles);
  const setStyle = useEditorStore((s) => s.setStyle);
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const current = findStyle(selected[0] ?? null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return STYLE_GROUPS.flatMap((g) =>
      g.styles.filter((s) => s.label.toLowerCase().includes(q)),
    );
  }, [query]);

  const popular = POPULAR_STYLE_IDS.map(findStyle).filter(Boolean);

  return (
    <>
      <PanelBody>
        <motion.div variants={staggerParent} initial="hidden" animate="visible">
          <Section>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${TOTAL_STYLES} styles`}
                className={cn(inputClass, "pl-10 pr-9")}
              />
              {query && (
                <IconButton
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setQuery("")}
                >
                  <X size={14} />
                </IconButton>
              )}
            </div>
          </Section>

          {matches ? (
            <Section title={`${matches.length} matching`}>
              <div className="grid grid-cols-2 gap-2.5">
                {matches.map((style) => (
                  <StyleTile
                    key={style!.id}
                    label={style!.label}
                    on={selected[0] === style!.id}
                    onPick={() => setStyle(style!.id)}
                  />
                ))}
              </div>
              {matches.length === 0 && (
                <p className="py-6 text-center text-[13px] text-ink-faint">
                  Nothing matches “{query}”.
                </p>
              )}
            </Section>
          ) : (
            <>
              <Section title="Popular">
                <div className="grid grid-cols-2 gap-2.5">
                  {popular.map((style) => (
                    <StyleTile
                      key={style!.id}
                      label={style!.label}
                      on={selected[0] === style!.id}
                      onPick={() => setStyle(style!.id)}
                    />
                  ))}
                </div>
              </Section>

              <Section title={`23 groups · ${TOTAL_STYLES} styles`}>
                <div className="flex flex-col">
                  {STYLE_GROUPS.map((group) => {
                    const open = openGroup === group.id;
                    const holdsCurrent = group.styles.some(
                      (s) => s.id === selected[0],
                    );
                    return (
                      <div
                        key={group.id}
                        className="border-b border-hairline last:border-0"
                      >
                        <motion.button
                          type="button"
                          onClick={() => setOpenGroup(open ? null : group.id)}
                          whileTap={{ scale: 0.99 }}
                          transition={springTight}
                          className="flex w-full items-center gap-2 py-2.5 text-left"
                        >
                          <motion.span
                            animate={{ rotate: open ? 90 : 0 }}
                            transition={springBouncy}
                            className="text-ink-faint"
                          >
                            <ChevronRight size={15} />
                          </motion.span>
                          <span
                            className={cn(
                              "flex-1 text-[13.5px] font-medium",
                              holdsCurrent ? "text-brand-red" : "text-ink",
                            )}
                          >
                            {group.label}
                          </span>
                          <span className="text-[11.5px] tabular-nums text-ink-faint">
                            {group.count}
                          </span>
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={springBouncy}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-2.5 pb-3">
                                {group.styles.map((style) => (
                                  <StyleTile
                                    key={style.id}
                                    label={style.label}
                                    on={selected[0] === style.id}
                                    onPick={() => setStyle(style.id)}
                                  />
                                ))}
                              </div>
                              {group.styles.length < group.count && (
                                <p className="pb-3 text-[11.5px] text-ink-faint">
                                  Showing {group.styles.length} of {group.count} —
                                  the rest come from the style service.
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </>
          )}
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <PrimaryButton disabled={!current}>
          {current ? `Redraw in ${current.label}` : "Pick a style"}
        </PrimaryButton>
        <p className="mt-2 text-center text-[11.5px] text-ink-faint">
          Stub — would redraw front and inside together. Message, signature and
          envelope carry over.
        </p>
      </PanelFooter>
    </>
  );
}

function StyleTile({
  label,
  on,
  onPick,
}: {
  label: string;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={springTight}
      className="text-left"
    >
      <span
        className={cn(
          "relative flex aspect-[4/5] items-end overflow-hidden rounded-[10px] p-2 ring-2 transition-shadow",
          on ? "shadow-rail ring-ink" : "ring-transparent hover:ring-hairline-strong",
        )}
        style={{
          // Placeholder until the style service supplies thumbnails; the tint is
          // derived from the name so a style looks the same everywhere it appears.
          backgroundImage: `linear-gradient(150deg, ${tintFor(label, 38)}, ${tintFor(label, 74)})`,
        }}
      >
        <span className="text-[11.5px] font-semibold leading-tight text-white drop-shadow">
          {label}
        </span>
        {on && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springBouncy}
            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
          >
            <Check size={12} strokeWidth={3} />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

/** Stable pseudo-random hue per style name, so tiles stay recognisable. */
function tintFor(label: string, lightness: number) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) % 360;
  }
  return `hsl(${hash} 42% ${lightness}%)`;
}
