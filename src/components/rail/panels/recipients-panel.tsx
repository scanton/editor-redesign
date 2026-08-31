"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import {
  PanelBody,
  Section,
  inputClass,
} from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import { priceOf } from "@/lib/pricing";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Who it goes to. A digital card is priced per recipient because each one gets
 * their own link, so this list is also the quantity.
 */
export function RecipientsPanel() {
  const isDigital = useEditorStore((s) => s.cardType === "digital");
  const recipients = useEditorStore((s) => s.fulfilment.recipients);
  const add = useEditorStore((s) => s.addRecipient);
  const update = useEditorStore((s) => s.updateRecipient);
  const remove = useEditorStore((s) => s.removeRecipient);
  const cardType = useEditorStore((s) => s.cardType);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <div className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {recipients.map((recipient) => (
                <motion.div
                  key={recipient.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springBouncy}
                  className="flex gap-3 rounded-[14px] border border-hairline p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[12px] font-semibold text-ink-soft">
                    {initials(recipient.name)}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      value={recipient.name}
                      onChange={(e) =>
                        update(recipient.id, { name: e.target.value })
                      }
                      placeholder="Name"
                      className={cn(inputClass, "py-1.5 text-[13.5px] font-medium")}
                    />
                    {isDigital ? (
                      <input
                        value={recipient.email}
                        onChange={(e) =>
                          update(recipient.id, { email: e.target.value })
                        }
                        placeholder="Email or leave blank for a link"
                        className={cn(inputClass, "py-1.5 text-[13px]")}
                      />
                    ) : (
                      <>
                        <input
                          value={recipient.line1}
                          onChange={(e) =>
                            update(recipient.id, { line1: e.target.value })
                          }
                          placeholder="Street address"
                          className={cn(inputClass, "py-1.5 text-[13px]")}
                        />
                        <input
                          value={recipient.line2}
                          onChange={(e) =>
                            update(recipient.id, { line2: e.target.value })
                          }
                          placeholder="City, state and ZIP"
                          className={cn(inputClass, "py-1.5 text-[13px]")}
                        />
                      </>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    aria-label={`Remove ${recipient.name || "recipient"}`}
                    onClick={() => remove(recipient.id)}
                    disabled={recipients.length === 1}
                    whileHover={
                      recipients.length > 1 ? { scale: 1.12, rotate: 90 } : undefined
                    }
                    whileTap={recipients.length > 1 ? { scale: 0.9 } : undefined}
                    transition={springTight}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint transition-opacity hover:bg-surface-sunken hover:text-ink disabled:opacity-25"
                  >
                    <X size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={add}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              transition={springTight}
              className="flex items-center justify-center gap-2 rounded-[14px] border border-dashed border-hairline-strong py-3 text-[13.5px] font-semibold text-ink-soft hover:border-ink-faint hover:text-ink"
            >
              <Plus size={16} />
              Add another
            </motion.button>
          </div>
        </Section>

        <Section>
          <p className="rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            {isDigital
              ? `Each recipient gets their own link, priced at ${priceOf(cardType).price}.`
              : "Every address is printed and posted separately."}
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
