"use client";

import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { springBouncy, springTight } from "@/lib/motion";
import { FRAME_TREATMENTS, findFrameTreatment } from "@/lib/long-form";
import { useEditorStore } from "@/store/editor-store";

/**
 * A frame has to come from somewhere, and there is no single right answer:
 * laying it on top is quick and leaves the art alone, moving the art around it
 * keeps every piece, clearing the space under it reads best. That is a
 * decision about someone's card, so the agent asks before it spends a render.
 */
export function FrameThread({ avatar }: { avatar: React.ReactNode }) {
  const frame = useEditorStore((s) => s.longForm.frame);
  const treatment = useEditorStore((s) =>
    findFrameTreatment(s.longForm.frameTreatment),
  );
  const renderAs = useEditorStore((s) => s.renderFrameAs);
  const cancel = useEditorStore((s) => s.renderLongFormFrame);

  if (frame === "none" || frame === "placed") return null;

  const asking = frame === "asking";

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springBouncy}
        className="flex gap-2.5"
      >
        {avatar}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[14px] leading-snug text-ink">
            A panel behind the words, then. What should I do with the artwork
            underneath it?
          </p>

          {asking && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {FRAME_TREATMENTS.map((option, i) => (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => renderAs(option.id)}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springBouncy, delay: 0.04 * i }}
                  whileHover={{ x: 3 }}
                  className="rounded-[12px] border border-hairline px-3 py-2 text-left hover:border-hairline-strong hover:bg-surface-sunken"
                >
                  <span className="block text-[13.5px] font-semibold text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-ink-faint">
                    {option.blurb}
                  </span>
                </motion.button>
              ))}

              <button
                type="button"
                onClick={cancel}
                className="mt-0.5 self-start rounded-full px-1 text-[12.5px] font-medium text-ink-faint hover:text-ink"
              >
                Leave it without one
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {!asking && treatment && (
        <>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTight}
            className="self-end rounded-[14px] rounded-br-[4px] bg-ink px-3 py-2 text-[13.5px] font-medium text-white"
          >
            {treatment.label}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springBouncy}
            className="flex gap-2.5"
          >
            {avatar}
            <p className="flex items-center gap-2 pt-0.5 text-[14px] leading-snug text-ink">
              {frame === "rendering" ? (
                <>
                  <Loader2 size={15} className="shrink-0 animate-spin text-brand-red" />
                  Re-rendering the panel…
                </>
              ) : (
                <>
                  <Check size={15} className="shrink-0 text-brand-red" />
                  {treatment.done}
                </>
              )}
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
