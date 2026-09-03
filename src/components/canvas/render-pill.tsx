"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2, RefreshCw } from "lucide-react";
import { springBouncy } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";

/**
 * The invitation's words are baked into its artwork, so editing a printed
 * detail leaves the render behind the data. Rather than silently redrawing on
 * every keystroke, the gap is made visible and the customer decides when to
 * spend a render on it.
 */
export function RenderPill() {
  const show = useEditorStore((s) => s.product === "invitation");
  const stale = useEditorStore((s) => s.invitation.stale);
  const rendering = useEditorStore((s) => s.invitation.rendering);
  const render = useEditorStore((s) => s.renderInvitation);
  const editing = useEditorStore((s) => s.step !== 3);

  const visible = show && editing && (stale || rendering);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[76px] z-30 flex justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96, transition: { duration: 0.14 } }}
            transition={springBouncy}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-hairline bg-surface/95 py-2 pl-4 pr-2 shadow-rail backdrop-blur"
          >
            {rendering ? (
              <>
                <Loader2 size={15} className="animate-spin text-brand-red" />
                <span className="pr-2 text-[13px] font-medium text-ink-soft">
                  Re-rendering your invitation…
                </span>
              </>
            ) : (
              <>
                <span className="text-[13px] font-medium text-ink-soft">
                  Event details changed
                </span>
                <motion.button
                  type="button"
                  onClick={render}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springBouncy}
                  className="flex items-center gap-1.5 rounded-full bg-brand-red px-3.5 py-1.5 text-[13px] font-semibold text-white"
                >
                  <RefreshCw size={13} />
                  Update invitation
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
