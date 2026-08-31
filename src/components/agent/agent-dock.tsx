"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eraser,
  ImagePlus,
  Lasso,
  Loader2,
  Scan,
  SquareDashedMousePointer,
  X,
} from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { springBouncy, springHeavy, staggerChild } from "@/lib/motion";
import type { AnnotationRequest } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";

const SUGGESTIONS = [
  "Add the graduate's name to the front",
  "Include the university name on the diploma",
  "Add a personal congratulatory message inside",
  "Change the comic book text colors",
  "Upload a photo of the graduate jumping",
  "Add the graduation year to the speech bubble",
];

const OPEN_WIDTH = 380;
const COLLAPSED_WIDTH = 68;

/**
 * Stampy holds the right-hand column at full height. The rail and the assistant
 * are two doors into the same room: anything you can do in a panel you can ask
 * for here, and asking here opens the panel that owns it.
 */
export function AgentDock() {
  const open = useEditorStore((s) => s.agentOpen);
  const setOpen = useEditorStore((s) => s.setAgentOpen);
  const requests = useEditorStore((s) => s.annotationRequests);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [draft, setDraft] = useState("");

  return (
    <motion.aside
      animate={{ width: open ? OPEN_WIDTH : COLLAPSED_WIDTH }}
      transition={springHeavy}
      className="relative z-40 flex h-full shrink-0 flex-col overflow-hidden border-l border-hairline bg-surface"
    >
      {open ? (
        <div style={{ width: OPEN_WIDTH }} className="flex h-full flex-col">
          <header className="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-3">
            <AgentAvatar />
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-surface-sunken"
            >
              New conversation
              <ChevronDown size={14} className="text-ink-faint" />
            </button>
            <Tooltip label="Collapse Stampy" side="bottom">
              <IconButton
                aria-label="Collapse assistant"
                className="ml-auto h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <ChevronRight size={17} />
              </IconButton>
            </Tooltip>
          </header>

          <div className="scroll-slim flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springBouncy, delay: 0.1 }}
              className="flex gap-2.5"
            >
              <AgentAvatar />
              <p className="pt-0.5 text-[14px] leading-snug text-ink">
                How would you like to customise this bold and heroic graduation
                card?
              </p>
            </motion.div>

            {requests.map((request) => (
              <AnnotationMessage key={request.id} request={request} />
            ))}
          </div>

          <AnimatePresence>
            {showSuggestions && requests.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12, transition: { duration: 0.14 } }}
                transition={springBouncy}
                className="mx-3 mb-3 shrink-0 rounded-[16px] border border-hairline bg-surface-sunken/70 p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-[13.5px] font-semibold text-ink">
                    How would you like to customise this card?
                  </h3>
                  <IconButton
                    aria-label="Dismiss suggestions"
                    className="-mr-1 -mt-1 h-7 w-7"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <X size={14} />
                  </IconButton>
                </div>
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.04 } },
                  }}
                  className="space-y-0.5"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.li key={s} variants={staggerChild}>
                      <motion.button
                        type="button"
                        onClick={() => setDraft(s)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left text-[13px] text-ink hover:bg-surface"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-ink-faint ring-1 ring-hairline">
                          {i + 1}
                        </span>
                        {s}
                      </motion.button>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Composer. */}
          <div className="shrink-0 border-t border-hairline px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-hairline px-3 py-2.5">
                <Tooltip label="Add a photo" side="top">
                  <button
                    type="button"
                    aria-label="Add a photo"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-surface-sunken hover:text-ink"
                  >
                    <ImagePlus size={16} />
                  </button>
                </Tooltip>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask, search or create your card"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
                />
              </div>

              <motion.button
                type="button"
                aria-label="Send"
                whileHover={{ scale: 1.08, rotate: -6 }}
                whileTap={{ scale: 0.9 }}
                transition={springBouncy}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white shadow-rail"
              >
                <ArrowUp size={18} />
              </motion.button>
            </div>
            <p className="mt-2.5 text-center text-[11.5px] text-ink-faint">
              Stampy and the rail are two doors into the same room.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{ width: COLLAPSED_WIDTH }}
          className="flex h-full flex-col items-center gap-3 py-3"
        >
          <Tooltip label="Open Stampy" side="left">
            <IconButton
              aria-label="Open assistant"
              className="h-10 w-10"
              onClick={() => setOpen(true)}
            >
              <ChevronLeft size={18} />
            </IconButton>
          </Tooltip>

          <motion.button
            type="button"
            aria-label="Open assistant"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.12, rotate: -8 }}
            whileTap={{ scale: 0.92 }}
            transition={springBouncy}
            className="flex flex-col items-center gap-3"
          >
            <AgentAvatar size={26} />
            {/* Named, not just an icon — you should know who you are reopening. */}
            <span
              className="text-[12px] font-semibold tracking-[0.08em] text-ink-soft"
              style={{ writingMode: "vertical-rl" }}
            >
              Stampy
            </span>
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
}

/**
 * An annotation arriving in the conversation: what the user asked, pinned to
 * the region they boxed, then the agent's (stubbed) response.
 */
function AnnotationMessage({ request }: { request: AnnotationRequest }) {
  const rendering = request.status === "rendering";
  const erasing = request.kind === "erase";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
      className="flex flex-col gap-2"
    >
      <div className="ml-auto max-w-[85%] rounded-[14px] rounded-br-[4px] bg-surface-sunken px-3 py-2">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          {erasing ? (
            <Eraser size={12} />
          ) : request.segmentLabel ? (
            <Scan size={12} />
          ) : request.points ? (
            <Lasso size={12} />
          ) : (
            <SquareDashedMousePointer size={12} />
          )}
          {request.face} ·{" "}
          {request.segmentLabel ??
            `${Math.round(request.rect.width)}×${Math.round(request.rect.height)}`}
        </span>
        <p className="text-[13.5px] leading-snug text-ink">
          {erasing ? "Remove what I painted over." : request.instruction}
        </p>
      </div>

      <div className="flex gap-2.5">
        <AgentAvatar size={20} />
        <p className="pt-0.5 text-[13.5px] leading-snug text-ink-soft">
          {rendering ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-brand-red" />
              {erasing ? "Erasing that…" : "Re-rendering that area…"}
            </span>
          ) : (
            <>
              Done.{" "}
              <span className="text-ink-faint">
                {erasing
                  ? "Stub — the agent would fill the gap in from the surrounding artwork."
                  : "Stub — the agent would return a fresh render of just that region."}
              </span>
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
}

function AgentAvatar({ size = 24 }: { size?: number }) {
  return (
    <motion.span
      className="flex shrink-0 items-center justify-center"
      animate={{ rotate: [0, -6, 6, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 5 }}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
        <path
          d="M16 28C16 28 3 20.4 3 11.9A7.2 7.2 0 0 1 16 7.9 7.2 7.2 0 0 1 29 11.9C29 20.4 16 28 16 28Z"
          fill="var(--color-brand-red)"
        />
        <circle cx="11.5" cy="13" r="1.9" fill="#fff" />
        <circle cx="20.5" cy="13" r="1.9" fill="#fff" />
      </svg>
    </motion.span>
  );
}
