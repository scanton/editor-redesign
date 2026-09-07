"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { springBouncy, springTight } from "@/lib/motion";
import {
  APPROACHES,
  findApproach,
  findLongForm,

} from "@/lib/long-form";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Picking a kind of long-form piece answers what to write, not who writes it.
 * That second question is the one worth asking out loud, so the agent asks it
 * here rather than the panel offering it as a pair of tabs — the difference
 * between "I've already written it" and "you write it" is a conversation.
 *
 * Scripted rather than generated: the exchange is fixed, the copy at the end
 * is a stub, and the point is the shape of the interaction.
 */
export function LongFormThread({ avatar }: { avatar: React.ReactNode }) {
  const longForm = useEditorStore((s) => s.longForm);
  const chooseApproach = useEditorStore((s) => s.chooseApproach);
  const setLongForm = useEditorStore((s) => s.setLongForm);
  const request = useEditorStore((s) => s.requestLongForm);

  const option = findLongForm(longForm.kind);
  const approach = findApproach(longForm.approach);
  if (!option) return null;

  const writing = longForm.status === "writing";
  // Whether *this* exchange has produced its words — not whether the card has
  // any, which it may well have from something else entirely.
  const wrote = !!approach && longForm.wroteWith === longForm.approach;

  return (
    <div className="flex flex-col gap-4">
      <Turn avatar={avatar}>
        <p className="text-[14px] leading-snug text-ink">
          A {option.label.toLowerCase()} — good choice. How do you want to
          handle the words?
        </p>

        <AnimatePresence initial={false}>
          {!approach && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTight}
              className="overflow-hidden"
            >
              <div className="mt-2.5 flex flex-col gap-1.5">
                {APPROACHES.map((a, i) => (
                  <motion.button
                    key={a.id}
                    type="button"
                    onClick={() => chooseApproach(a.id)}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springBouncy, delay: 0.04 * i }}
                    whileHover={{ x: 3 }}
                    className="rounded-[12px] border border-hairline px-3 py-2 text-left hover:border-hairline-strong hover:bg-surface-sunken"
                  >
                    <span className="block text-[13.5px] font-semibold text-ink">
                      {a.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink-faint">
                      {a.blurb}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Turn>

      {approach && (
        <>
          {/* What you said back, so the thread reads as an exchange. */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTight}
            className="self-end rounded-[14px] rounded-br-[4px] bg-ink px-3 py-2 text-[13.5px] font-medium text-white"
          >
            {approach.label}
          </motion.p>

          <Turn avatar={avatar}>
            <p className="text-[14px] leading-snug text-ink">{approach.ask}</p>

            {!wrote && (
              <DraftBox
                value={longForm.draft}
                onChange={(draft) => setLongForm({ draft })}
                placeholder={approach.placeholder}
                cta={approach.cta}
                busy={writing}
                onSend={request}
              />
            )}

            {wrote && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springBouncy}
                className="mt-2.5 flex items-center gap-2 rounded-[12px] bg-surface-sunken/70 px-3 py-2 text-[12.5px] text-ink-soft"
              >
                <Check size={14} className="shrink-0 text-brand-red" />
                It&apos;s on the card. Drag the box to move it, pull a corner to
                resize — the type refits either way.
              </motion.p>
            )}
          </Turn>

          {/* Changing your mind is a message too. */}
          {!writing && (
            <button
              type="button"
              onClick={() => chooseApproach(null)}
              className="self-end rounded-full px-2 text-[12px] font-medium text-ink-faint hover:text-ink"
            >
              Do it a different way
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Turn({
  avatar,
  children,
}: {
  avatar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
      className="flex gap-2.5"
    >
      {avatar}
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </motion.div>
  );
}

function DraftBox({
  value,
  onChange,
  placeholder,
  cta,
  busy,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  cta: string;
  busy: boolean;
  onSend: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const ready = value.trim().length > 0 && !busy;

  return (
    <div
      className={cn(
        "mt-2.5 rounded-[14px] border bg-surface transition-colors",
        focused ? "border-ink-faint" : "border-hairline",
      )}
    >
      <textarea
        rows={4}
        value={value}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="scroll-slim w-full resize-none bg-transparent px-3 pt-2.5 text-[13.5px] leading-snug text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
        <span className="pl-0.5 text-[11.5px] tabular-nums text-ink-faint">
          {value.trim() ? `${value.trim().split(/\s+/).length} words` : " "}
        </span>
        <motion.button
          type="button"
          onClick={onSend}
          disabled={!ready}
          whileHover={ready ? { scale: 1.03 } : undefined}
          whileTap={ready ? { scale: 0.96 } : undefined}
          transition={springTight}
          className="flex items-center gap-1.5 rounded-full bg-brand-red px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-35"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowUp size={14} />
          )}
          {busy ? "Working…" : cta}
        </motion.button>
      </div>
    </div>
  );
}
