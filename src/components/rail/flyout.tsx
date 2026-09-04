"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { TOOLS, toolLabel } from "@/components/rail/tools";
import { FlowNav } from "@/components/rail/flow-nav";
import { BackgroundPanel } from "@/components/rail/panels/background-panel";
import { CardTypePanel } from "@/components/rail/panels/card-type-panel";
import { DeliveryPanel } from "@/components/rail/panels/delivery-panel";
import { EventPanel } from "@/components/rail/panels/event-panel";
import { PrintOptionsPanel } from "@/components/rail/panels/print-options-panel";
import { RecipientsPanel } from "@/components/rail/panels/recipients-panel";
import { CoverPanel } from "@/components/rail/panels/cover-panel";
import { EnvelopePanel } from "@/components/rail/panels/envelope-panel";
import { LongFormPanel } from "@/components/rail/panels/long-form-panel";
import { MessagePanel } from "@/components/rail/panels/message-panel";
import { SignaturePanel } from "@/components/rail/panels/signature-panel";
import { RevealPanel } from "@/components/rail/panels/reveal-panel";
import { ReviewPanel } from "@/components/rail/panels/review-panel";
import { StylesPanel } from "@/components/rail/panels/styles-panel";
import { TrimPanel } from "@/components/rail/panels/trim-panel";
import { TranslationsPanel } from "@/components/rail/panels/translations-panel";
import { bounceOut, flyoutClose } from "@/lib/motion";
import { FLYOUT_WIDTH } from "@/lib/layout";
import type { ToolId } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";

const PANELS: Record<ToolId, React.ComponentType> = {
  styles: StylesPanel,
  event: EventPanel,
  message: MessagePanel,
  signature: SignaturePanel,
  translations: TranslationsPanel,
  longform: LongFormPanel,
  cardtype: CardTypePanel,
  trim: TrimPanel,
  background: BackgroundPanel,
  envelope: EnvelopePanel,
  reveal: RevealPanel,
  cover: CoverPanel,
  delivery: DeliveryPanel,
  recipients: RecipientsPanel,
  printopts: PrintOptionsPanel,
  review: ReviewPanel,
};

/**
 * The panel and the space it occupies are one moving object: the outer slot
 * animates its width with the bounce, and the panel is pinned to that slot's
 * right edge. As the slot grows, the panel is revealed sliding out from behind
 * the rail — so nothing appears before the bounce delivers it.
 *
 * Switching between tools swaps the contents in place — you asked for Message,
 * you get Message, without waiting for Styles to leave first.
 */
export function Flyout() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);
  const product = useEditorStore((s) => s.product);
  const tool = TOOLS.find((t) => t.id === activeTool);
  const label = tool ? toolLabel(tool, product) : "";
  const Panel = tool ? PANELS[tool.id] : null;

  return (
    <AnimatePresence>
      {tool && Panel && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: FLYOUT_WIDTH, transition: bounceOut }}
          exit={{ width: 0, transition: flyoutClose }}
          // Clips the panel against the rail; the shadow lives out here so it
          // isn't cut off by that clip.
          className="relative z-10 shrink-0 overflow-hidden shadow-rail"
        >
          <aside
            style={{ width: FLYOUT_WIDTH }}
            className="absolute right-0 top-0 flex h-full flex-col border-r border-hairline bg-surface"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-hairline px-5 py-4">
              <h2 className="font-display text-[19px] font-semibold leading-tight text-ink">
                {label}
              </h2>
              <IconButton
                aria-label={`Close ${label}`}
                onClick={() => setTool(null)}
                className="-mr-1 shrink-0"
              >
                <X size={18} />
              </IconButton>
            </header>

            {/* Keyed so each tool's panel remounts with its own entrance stagger. */}
            <Panel key={tool.id} />

            <FlowNav />
          </aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
