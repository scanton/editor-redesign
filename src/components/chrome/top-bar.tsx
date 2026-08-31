"use client";

import { motion } from "motion/react";
import {
  Eye,
  Maximize2,
  Minus,
  MoreVertical,
  Plus,
  Redo2,
  ShoppingCart,
  Undo2,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { Logo } from "@/components/chrome/logo";
import { Stepper } from "@/components/chrome/stepper";
import { springBouncy, springTight } from "@/lib/motion";
import { useEditorStore } from "@/store/editor-store";

export function TopBar() {
  const step = useEditorStore((s) => s.step);

  return (
    <header className="relative z-30 flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-3 border-b border-hairline bg-surface px-4">
      <div className="flex min-w-0 items-center gap-6">
        <Logo />
        <Stepper />
      </div>

      {/* Finish is checkout, not editing: the view controls step aside and the
          price takes their place. */}
      <div className="flex items-center gap-2">
        {step === 3 ? <FinishBar /> : <EditTools />}
      </div>
    </header>
  );
}

function CreditsPill() {
  const credits = useEditorStore((s) => s.credits);

  return (
    <motion.div
      className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-sunken px-3 py-2"
      whileHover={{ scale: 1.03 }}
      transition={springTight}
    >
      <motion.span
        aria-hidden
        className="text-base leading-none"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4 }}
      >
        💗
      </motion.span>
      <span className="text-sm font-semibold text-ink">
        {credits.toLocaleString()}
      </span>
      <span className="text-sm text-ink-soft">Heart Credits</span>
    </motion.div>
  );
}

function FinishBar() {
  const total = useEditorStore((s) => s.orderTotal());
  const cardType = useEditorStore((s) => s.cardType);
  const recipients = useEditorStore((s) => s.fulfilment.recipients.length);
  const quantity = useEditorStore((s) => s.fulfilment.quantity);

  const units =
    cardType === "digital"
      ? plural(recipients, "digital send")
      : plural(quantity, "printed card");

  return (
    <>
      <CreditsPill />

      <Tooltip label="Cart" side="bottom">
        <IconButton aria-label="Cart">
          <ShoppingCart size={19} />
        </IconButton>
      </Tooltip>

      <div className="ml-2 text-right leading-tight">
        <div className="font-display text-[19px] font-semibold tabular-nums text-ink">
          ${total.toFixed(2)}
        </div>
        <div className="text-[11.5px] text-ink-faint">{units}</div>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={springBouncy}
        className="ml-1 shrink-0 whitespace-nowrap rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-rail"
      >
        Checkout
      </motion.button>
    </>
  );
}

function EditTools() {
  const zoom = useEditorStore((s) => s.zoom);
  const nudgeZoom = useEditorStore((s) => s.nudgeZoom);
  const fitZoom = useEditorStore((s) => s.fitZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  return (
    <>
      <CreditsPill />

      <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-hairline px-1.5 py-1">
        <Tooltip label="Fit to screen" side="bottom">
          <IconButton aria-label="Fit to screen" className="h-8 w-8" onClick={fitZoom}>
            <Maximize2 size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip label="Zoom out" side="bottom">
          <IconButton
            aria-label="Zoom out"
            className="h-8 w-8"
            onClick={() => nudgeZoom(-0.05)}
          >
            <Minus size={16} />
          </IconButton>
        </Tooltip>
        <div className="flex min-w-[56px] items-center justify-center gap-0.5 text-sm font-semibold tabular-nums text-ink">
          {Math.round(zoom * 100)}
          <span className="text-ink-faint">%</span>
        </div>
        <Tooltip label="Zoom in" side="bottom">
          <IconButton
            aria-label="Zoom in"
            className="h-8 w-8"
            onClick={() => nudgeZoom(0.05)}
          >
            <Plus size={16} />
          </IconButton>
        </Tooltip>
      </div>

      <div className="h-6 w-px shrink-0 bg-hairline" />

      <Tooltip label="Undo" side="bottom">
        <IconButton aria-label="Undo" onClick={undo} disabled={!canUndo}>
          <Undo2 size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip label="Redo" side="bottom">
        <IconButton aria-label="Redo" onClick={redo} disabled={!canRedo}>
          <Redo2 size={18} />
        </IconButton>
      </Tooltip>

      <div className="h-6 w-px shrink-0 bg-hairline" />

      <Tooltip label="More" side="bottom">
        <IconButton aria-label="More options">
          <MoreVertical size={18} />
        </IconButton>
      </Tooltip>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={springBouncy}
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-sunken"
      >
        <Eye size={18} />
        Preview
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={springBouncy}
        className="shrink-0 whitespace-nowrap rounded-full bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-rail"
      >
        Prepare for cart
      </motion.button>

      <Tooltip label="Cart" side="bottom">
        <IconButton aria-label="Cart">
          <ShoppingCart size={19} />
        </IconButton>
      </Tooltip>
    </>
  );
}

function plural(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}
