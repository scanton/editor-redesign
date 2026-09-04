"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { springBouncy, springTight, staggerChild } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ layout */

/** Scrolling body of a flyout panel. Panels own their own footer. */
export function PanelBody({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-5 py-5">
      {children}
    </div>
  );
}

export function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...springBouncy, delay: 0.08 }}
      className="shrink-0 border-t border-hairline bg-surface px-5 py-4"
    >
      {children}
    </motion.div>
  );
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={staggerChild}
      className={cn("mb-6 last:mb-0", className)}
    >
      {title && (
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[15px] font-bold leading-none text-ink">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export function Divider() {
  return <motion.hr variants={staggerChild} className="my-5 border-hairline" />;
}

/* ----------------------------------------------------------------- buttons */

export function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={springBouncy}
      className={cn(
        "w-full rounded-full py-3 text-[15px] font-semibold text-white transition-colors",
        disabled
          ? "cursor-not-allowed bg-brand-red/40"
          : "bg-brand-red shadow-rail hover:bg-brand-red-hover",
      )}
    >
      {children}
    </motion.button>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.94 }}
      transition={springTight}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
        active
          ? "border-transparent bg-ink text-white"
          : "border-hairline bg-surface text-ink-soft hover:border-hairline-strong hover:text-ink",
      )}
    >
      {children}
    </motion.button>
  );
}

/* --------------------------------------------------------------- segmented */

export type SegmentOption = { value: string; label: string };

/**
 * The tab control the current panels lean on (Write/Upload/Emoji,
 * Create/Library, Draw/Upload/Type). The active pill slides between segments.
 */
export function Segmented({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-surface-sunken p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex-1 rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors",
              active ? "text-ink" : "text-ink-faint hover:text-ink-soft",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segment-${id}`}
                transition={springBouncy}
                className="absolute inset-0 rounded-full bg-surface shadow-rail"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ select */

export type SelectOption = {
  value: string;
  label: string;
  /** Optional preview rendered in the sample font. */
  sample?: string;
  fontFamily?: string;
  /** Offered but not choosable — a detail type already used, say. */
  disabled?: boolean;
  /** Heading this option sits under. Options are shown in list order. */
  group?: string;
};

export function Select({
  options,
  value,
  onChange,
  className,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Shown when nothing is chosen yet. */
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.985 }}
        transition={springTight}
        className="flex w-full items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2.5 text-left text-[14px] text-ink hover:border-hairline-strong"
      >
        <span
          className={cn(
            "truncate font-medium",
            !current && "font-normal text-ink-faint",
          )}
        >
          {current?.label ?? placeholder}
        </span>
        {current?.sample && (
          <span
            className="truncate text-ink-faint"
            style={{ fontFamily: current.fontFamily }}
          >
            {current.sample}
          </span>
        )}
        <motion.span
          className="ml-auto shrink-0 text-ink-faint"
          animate={{ rotate: open ? 180 : 0 }}
          transition={springBouncy}
        >
          <ChevronDown size={16} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={springBouncy}
            style={{ transformOrigin: "top center" }}
            className="scroll-slim absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto rounded-[16px] border border-hairline bg-surface p-1.5 shadow-pop"
          >
            {options.map((option, i) => (
              <li key={option.value}>
                {option.group && option.group !== options[i - 1]?.group && (
                  <p className="px-3 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
                    {option.group}
                  </p>
                )}
                <motion.button
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  whileHover={option.disabled ? undefined : { x: 3 }}
                  transition={springTight}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[11px] px-3 py-2 text-left text-[14px]",
                    option.disabled
                      ? "cursor-default text-ink-faint"
                      : cn(
                          "hover:bg-surface-sunken",
                          option.value === value ? "text-ink" : "text-ink-soft",
                        ),
                  )}
                >
                  <span className="truncate font-medium">{option.label}</span>
                  {option.sample && (
                    <span
                      className="truncate text-ink-faint"
                      style={{ fontFamily: option.fontFamily }}
                    >
                      {option.sample}
                    </span>
                  )}
                  {option.disabled && (
                    <span className="ml-auto shrink-0 text-[10.5px] uppercase tracking-[0.06em]">
                      Added
                    </span>
                  )}
                  {!option.disabled && option.value === value && (
                    <Check size={15} className="ml-auto shrink-0 text-brand-red" />
                  )}
                </motion.button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ colors */

/** The rainbow eyedropper button that opens a full picker in the real editor. */
export function ColorWheelButton({
  color,
  onClick,
}: {
  color: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Pick a custom color"
      whileHover={{ scale: 1.12, rotate: 12 }}
      whileTap={{ scale: 0.9 }}
      transition={springBouncy}
      className="relative h-9 w-9 rounded-full p-[3px]"
      style={{
        backgroundImage:
          "conic-gradient(#ff2d55,#ff9500,#ffd23f,#34c759,#00c7be,#1f3fd8,#af52de,#ff2d55)",
      }}
    >
      <span
        className="block h-full w-full rounded-full ring-1 ring-black/10"
        style={{ backgroundColor: color }}
      />
    </motion.button>
  );
}

export function SwatchGrid({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value?: string;
  onChange?: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-2.5">
      {colors.map((color) => (
        <motion.button
          key={color}
          type="button"
          aria-label={color}
          onClick={() => onChange?.(color)}
          whileHover={{ scale: 1.22, rotate: -6 }}
          whileTap={{ scale: 0.88 }}
          transition={springBouncy}
          className={cn(
            "aspect-square rounded-full ring-offset-2 ring-offset-surface",
            value?.toLowerCase() === color.toLowerCase()
              ? "ring-2 ring-ink"
              : "ring-1 ring-black/10",
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- misc */

/**
 * Marks something we're deliberately not building for the demo — an AI call, a
 * render pipeline, an upload. Keeps the seams visible instead of faking depth.
 */
export function StubCard({
  title,
  note,
  icon,
  onClick,
}: {
  title: string;
  note: string;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springBouncy}
      className="flex w-full items-start gap-3 rounded-[14px] border border-dashed border-hairline-strong bg-surface-sunken/60 p-4 text-left"
    >
      {icon && <span className="mt-0.5 text-ink-faint">{icon}</span>}
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-faint">
          {note}
        </span>
      </span>
    </motion.button>
  );
}

/**
 * Marks a control that is designed but not built. Distinct from a "Stub" note:
 * a stub stands in for something that exists, Planned says it does not yet.
 */
export function PlannedBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-red/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
      Planned
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-red" : "bg-hairline-strong",
      )}
    >
      <motion.span
        layout
        transition={springBouncy}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ left: checked ? 18 : 2 }}
      />
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-3 block last:mb-0">
      <span className="mb-1.5 block text-[15px] font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[12px] border border-hairline bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-ink-faint focus:outline-none";
