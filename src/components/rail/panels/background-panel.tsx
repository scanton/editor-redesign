"use client";

import { motion } from "motion/react";
import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PanelBody,
  Section,
  inputClass,
} from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import {
  BACKGROUNDS,
  BACKGROUND_ROWS,
  BACKGROUND_TABS,
  TOTAL_BACKGROUNDS,
  findBackground,
} from "@/lib/digital-card";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * The scene behind the card. It sits behind the artwork rather than in it, so
 * changing it is instant — there is nothing to re-render.
 */
export function BackgroundPanel() {
  const digital = useEditorStore((s) => s.digital);
  const setDigital = useEditorStore((s) => s.setDigital);
  const [query, setQuery] = useState("");

  const tab = digital.backgroundTab;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const hits = BACKGROUNDS.filter((b) =>
        b.label.toLowerCase().includes(q),
      );
      return [{ id: "search", title: `${hits.length} matching`, count: hits.length, ids: hits.map((b) => b.id), wide: false }];
    }
    return BACKGROUND_ROWS.map((row) => ({
      ...row,
      ids: row.ids.filter(
        (id) => tab === "All" || findBackground(id).kind === tab,
      ),
    })).filter((row) => row.ids.length > 0);
  }, [query, tab]);

  return (
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
              placeholder={`Search ${TOTAL_BACKGROUNDS}+ backgrounds`}
              className={cn(inputClass, "pl-10")}
            />
          </div>
        </Section>

        <Section>
          <div className="flex flex-wrap gap-2">
            {BACKGROUND_TABS.map((t) => (
              <motion.button
                key={t}
                type="button"
                onClick={() => setDigital({ backgroundTab: t })}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={springTight}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  tab === t
                    ? "border-transparent bg-ink text-white"
                    : "border-hairline text-ink-soft hover:text-ink",
                )}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </Section>

        {rows.map((row) => (
          <Section
            key={row.id}
            title={row.title}
            action={
              <span className="text-[11.5px] tabular-nums text-ink-faint">
                {row.count}
              </span>
            }
          >
            <div
              className={cn(
                "grid gap-2.5",
                row.wide ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {row.ids.map((id) => {
                const bg = findBackground(id);
                const on = digital.background === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => setDigital({ background: id })}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springTight}
                    className="text-left"
                  >
                    <span
                      className={cn(
                        "relative flex items-end overflow-hidden rounded-[9px] p-1.5 ring-2 transition-shadow",
                        row.wide ? "aspect-[16/10]" : "aspect-square",
                        on
                          ? "shadow-rail ring-ink"
                          : "ring-transparent hover:ring-hairline-strong",
                      )}
                      style={{
                        backgroundImage: `linear-gradient(145deg, ${bg.gradient})`,
                      }}
                    >
                      <span className="text-[10.5px] font-semibold leading-tight text-white drop-shadow">
                        {bg.label}
                      </span>
                      {on && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={springBouncy}
                          className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-white"
                        >
                          <Check size={10} strokeWidth={3} />
                        </motion.span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Section>
        ))}

        <Section>
          <p className="rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            Scene changes are instant. The scene sits behind the card rather than
            in it, so your artwork is never touched and there is nothing to wait
            for.
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}
