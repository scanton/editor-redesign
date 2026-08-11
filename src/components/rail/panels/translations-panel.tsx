"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Info, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PanelBody,
  PanelFooter,
  PrimaryButton,
  Section,
  inputClass,
} from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import { LANGUAGES, SCRIPTS, findLanguage } from "@/lib/languages";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

export function TranslationsPanel() {
  const [query, setQuery] = useState("");
  const target = useEditorStore((s) => s.targetLanguage);
  const setTarget = useEditorStore((s) => s.setTargetLanguage);
  const status = useEditorStore((s) => s.translationStatus);
  const requestTranslation = useEditorStore((s) => s.requestTranslation);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? LANGUAGES.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.native.toLowerCase().includes(q),
        )
      : LANGUAGES;
    return SCRIPTS.map((script) => ({
      ...script,
      languages: matches.filter((l) => l.script === script.id),
    })).filter((g) => g.languages.length > 0);
  }, [query]);

  const selected = findLanguage(target);

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
                placeholder="Search languages"
                className={cn(inputClass, "pl-10")}
              />
            </div>
          </Section>

          {groups.map((group) => (
            <Section key={group.id} title={group.label}>
              <ul className="space-y-1">
                {group.languages.map((language) => {
                  const isOn = target === language.id;
                  return (
                    <li key={language.id}>
                      <motion.button
                        type="button"
                        onClick={() => setTarget(isOn ? null : language.id)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.99 }}
                        transition={springTight}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[12px] border px-3 py-2 text-left transition-colors",
                          isOn
                            ? "border-ink bg-surface-sunken"
                            : "border-transparent hover:bg-surface-sunken",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium text-ink">
                            {language.native}
                          </span>
                          <span className="block truncate text-[12px] text-ink-faint">
                            {language.name}
                          </span>
                        </span>
                        <AnimatePresence>
                          {isOn && (
                            <motion.span
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={springBouncy}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white"
                            >
                              <Check size={12} strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </Section>
          ))}

          {groups.length === 0 && (
            <p className="py-6 text-center text-[13px] text-ink-faint">
              No languages match “{query}”.
            </p>
          )}

          <motion.p className="flex gap-2 rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              Latin, Cyrillic, Japanese and Chinese are covered by our card
              typefaces. Arabic, Hebrew, Thai, Hangul and Devanagari need new
              font licensing first.
            </span>
          </motion.p>
        </motion.div>
      </PanelBody>

      <PanelFooter>
        <PrimaryButton
          disabled={!selected || status === "translating"}
          onClick={requestTranslation}
        >
          {status === "translating" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Translating…
            </span>
          ) : selected ? (
            `Translate to ${selected.name}`
          ) : (
            "Translate"
          )}
        </PrimaryButton>
        <p className="mt-2 text-center text-[11.5px] text-ink-faint">
          {status === "done"
            ? "Stub — all three faces would come back re-rendered."
            : "Re-renders every face with translated type."}
        </p>
      </PanelFooter>
    </>
  );
}
