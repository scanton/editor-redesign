"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Eye, EyeOff, Info, Plus, Trash2, X } from "lucide-react";
import {
  Field,
  PanelBody,
  Section,
  Segmented,
  Toggle,
  inputClass,
} from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import {
  DETAIL_SUGGESTIONS,
  QR_SHAPES,
  RSVP_METHODS,
  buildInvitationDetails,
  type EventDetail,
  type RsvpMethod,
} from "@/lib/invitation";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Where an invitation differs from a greeting card. A card is written; an
 * invitation is described — these fields are the data the image model bakes
 * into the back panel, not text you edit on the canvas.
 *
 * The eye on each detail is the load-bearing control: everything here is
 * collected and reaches the event page, and the eye decides which of it is
 * also printed.
 */
export function EventPanel() {
  const inv = useEditorStore((s) => s.invitation);
  const set = useEditorStore((s) => s.setInvitation);

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <p className="text-[12.5px] leading-snug text-ink-faint">
            Your invitation re-renders from these details — the words are part of
            the artwork, not a layer on top of it.
          </p>
        </Section>

        <Section title="Basics">
          <Field label="Event name">
            <input
              className={inputClass}
              value={inv.eventName}
              onChange={(e) => set({ eventName: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClass}
              value={inv.tagline}
              onChange={(e) => set({ tagline: e.target.value })}
            />
          </Field>
          <Field label="Hosted by">
            <input
              className={inputClass}
              value={inv.hosts}
              placeholder="Separate names with commas"
              onChange={(e) => set({ hosts: e.target.value })}
            />
          </Field>
        </Section>

        <Section title="When">
          <Field label="Date">
            <input
              className={inputClass}
              value={inv.date}
              onChange={(e) => set({ date: e.target.value })}
            />
          </Field>
          <Field label="Time">
            <input
              className={inputClass}
              value={inv.time}
              onChange={(e) => set({ time: e.target.value })}
            />
          </Field>
        </Section>

        <Section title="Where">
          <Field label="Venue">
            <input
              className={inputClass}
              value={inv.locationName}
              onChange={(e) => set({ locationName: e.target.value })}
            />
          </Field>
          <Field label="Address">
            <input
              className={inputClass}
              value={inv.address}
              onChange={(e) => set({ address: e.target.value })}
            />
          </Field>
        </Section>

        <MoreDetails />
        <Rsvp />

        <Section>
          <p className="flex gap-2 rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            <Info size={14} className="mt-px shrink-0" />
            <span>
              Guest questions, plus-ones and capacity are set up after checkout
              in My Events, which is also where the RSVP page is managed. Only
              what goes on the invitation belongs here.
            </span>
          </p>
        </Section>

        <Payload />
      </motion.div>
    </PanelBody>
  );
}

/* -------------------------------------------------------------- the details */

function MoreDetails() {
  const details = useEditorStore((s) => s.invitation.details);
  const addDetail = useEditorStore((s) => s.addDetail);
  const [adding, setAdding] = useState(false);
  const [custom, setCustom] = useState<string | null>(null);

  const taken = new Set(details.map((d) => d.label));

  return (
    <Section title="More details">
      <p className="mb-3 text-[12.5px] leading-snug text-ink-faint">
        The eye chooses what renders on the invitation. Hidden fields are still
        collected — they just live on your event page.
      </p>

      <div className="flex flex-col gap-3">
        {details.map((detail) => (
          <DetailRow key={detail.id} detail={detail} />
        ))}
      </div>

      {custom !== null && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTight}
          className="mt-3 flex items-center gap-2"
        >
          <input
            autoFocus
            className={inputClass}
            placeholder="Field label"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !custom.trim()) return;
              addDetail(custom.trim(), null, true);
              setCustom(null);
            }}
          />
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => {
              addDetail(custom.trim(), null, true);
              setCustom(null);
            }}
            className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-35"
          >
            Add
          </button>
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setCustom(null)}
            className="shrink-0 rounded-full p-2 text-ink-faint hover:bg-surface-sunken hover:text-ink"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}

      <div className="relative mt-3">
        <motion.button
          type="button"
          onClick={() => setAdding((v) => !v)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={springTight}
          className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink hover:border-hairline-strong"
        >
          <Plus size={14} />
          Add a detail
        </motion.button>

        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
              transition={springBouncy}
              className="absolute left-0 top-full z-20 mt-1.5 w-full origin-top overflow-hidden rounded-[14px] border border-hairline bg-surface py-1 shadow-rail"
            >
              {DETAIL_SUGGESTIONS.map((s) => {
                const used = taken.has(s.label);
                return (
                  <button
                    key={s.label}
                    type="button"
                    disabled={used}
                    onClick={() => {
                      addDetail(s.label, s.slot, s.onInvitation);
                      setAdding(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13.5px]",
                      used
                        ? "text-ink-faint"
                        : "text-ink hover:bg-surface-sunken",
                    )}
                  >
                    {s.label}
                    <span className="text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
                      {used ? "Added" : s.slot ? "Schema" : "Custom"}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setCustom("");
                  setAdding(false);
                }}
                className="flex w-full items-center gap-2 border-t border-hairline px-3 py-2 text-left text-[13.5px] font-semibold text-ink hover:bg-surface-sunken"
              >
                <Plus size={13} />
                Something else
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

function DetailRow({ detail }: { detail: EventDetail }) {
  const updateDetail = useEditorStore((s) => s.updateDetail);
  const removeDetail = useEditorStore((s) => s.removeDetail);
  const shown = detail.onInvitation;

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[15px] font-bold text-ink">{detail.label}</span>
        <button
          type="button"
          aria-pressed={shown}
          title={shown ? "Shown on the invitation" : "Event page only"}
          onClick={() => updateDetail(detail.id, { onInvitation: !shown })}
          className={cn(
            "rounded-full p-1 transition-colors",
            shown ? "text-ink hover:bg-surface-sunken" : "text-ink-faint hover:text-ink-soft",
          )}
        >
          {shown ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          type="button"
          aria-label={`Remove ${detail.label}`}
          onClick={() => removeDetail(detail.id)}
          className="rounded-full p-1 text-ink-faint opacity-0 transition-opacity hover:text-brand-red focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
        {!shown && (
          <span className="ml-auto text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
            Event page only
          </span>
        )}
      </div>

      {detail.slot === "schedule" ? (
        <ScheduleRows />
      ) : (
        <input
          className={inputClass}
          value={detail.value}
          onChange={(e) => updateDetail(detail.id, { value: e.target.value })}
        />
      )}
    </div>
  );
}

function ScheduleRows() {
  const schedule = useEditorStore((s) => s.invitation.schedule);
  const setSchedule = useEditorStore((s) => s.setSchedule);
  const rows = schedule.length ? schedule : [{ time: "", item: "" }];

  const patch = (i: number, next: Partial<{ time: string; item: string }>) =>
    setSchedule(rows.map((r, j) => (j === i ? { ...r, ...next } : r)));

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={cn(inputClass, "w-[92px] shrink-0")}
            placeholder="9:00 PM"
            value={row.time}
            onChange={(e) => patch(i, { time: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Doors open"
            value={row.item}
            onChange={(e) => patch(i, { item: e.target.value })}
          />
          <button
            type="button"
            aria-label="Remove row"
            disabled={rows.length === 1}
            onClick={() => setSchedule(rows.filter((_, j) => j !== i))}
            className="shrink-0 rounded-full p-2 text-ink-faint hover:text-brand-red disabled:opacity-30"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSchedule([...rows, { time: "", item: "" }])}
        className="self-start rounded-full px-1 text-[12.5px] font-semibold text-ink-soft hover:text-ink"
      >
        + Add a line
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- the RSVP */

function Rsvp() {
  const inv = useEditorStore((s) => s.invitation);
  const set = useEditorStore((s) => s.setInvitation);
  const cardType = useEditorStore((s) => s.cardType);
  const method = RSVP_METHODS.find((m) => m.value === inv.rsvpMethod)!;

  return (
    <Section title="RSVP">
      <label className="flex items-center justify-between gap-3 py-1">
        <span className="text-[14px] font-medium text-ink">Collect RSVPs</span>
        <Toggle
          checked={inv.rsvpOn}
          onChange={(rsvpOn) => set({ rsvpOn })}
          label="Collect RSVPs"
        />
      </label>

      <AnimatePresence initial={false}>
        {inv.rsvpOn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springTight}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <Field label="Reply by">
                <input
                  className={inputClass}
                  value={inv.rsvpDeadline}
                  onChange={(e) => set({ rsvpDeadline: e.target.value })}
                />
              </Field>
              <Field label="RSVP line">
                <input
                  className={inputClass}
                  value={inv.rsvpLine}
                  placeholder="What the invitation says about replying"
                  onChange={(e) => set({ rsvpLine: e.target.value })}
                />
              </Field>

              <Field label="How they reply">
                <Segmented
                  id="rsvp-method"
                  value={inv.rsvpMethod}
                  onChange={(v) => set({ rsvpMethod: v as RsvpMethod })}
                  options={RSVP_METHODS.map((m) => ({
                    value: m.value,
                    label: m.label,
                  }))}
                />
                <input
                  className={cn(inputClass, "mt-2")}
                  value={inv.rsvpValue}
                  placeholder={method.placeholder}
                  onChange={(e) => set({ rsvpValue: e.target.value })}
                />
              </Field>

              <div className="mt-4 rounded-[12px] border border-hairline p-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-medium text-ink">
                    Show QR code on the invitation
                  </span>
                  <Toggle
                    checked={inv.qrOn}
                    onChange={(qrOn) => set({ qrOn })}
                    label="Show QR code on the invitation"
                  />
                </label>
                <p className="mt-2 text-[12px] leading-snug text-ink-faint">
                  {cardType === "printed"
                    ? "On print this is how guests reach the page at all — there is no link to tap."
                    : "Optional on a digital invitation: the link it opens is already attached to the send."}{" "}
                  Drag the code on the back panel to place it.
                </p>

                <AnimatePresence initial={false}>
                  {inv.qrOn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={springTight}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {QR_SHAPES.map((shape) => (
                          <button
                            key={shape.value}
                            type="button"
                            onClick={() => set({ qrShape: shape.value })}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                              inv.qrShape === shape.value
                                ? "border-transparent bg-ink text-white"
                                : "border-hairline text-ink-soft hover:text-ink",
                            )}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

/* --------------------------------------------------------------- the payload */

/**
 * What the renderer actually receives — printed fields only, which is why a
 * detail with its eye closed disappears from here while staying in the panel.
 * A demo aid rather than product UI: it is here so the collection can be
 * checked against the schema at a glance.
 */
function Payload() {
  const inv = useEditorStore((s) => s.invitation);
  const json = JSON.stringify(buildInvitationDetails(inv), null, 2);

  return (
    <Section>
      <details className="rounded-[12px] border border-hairline">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft hover:text-ink">
          invitationDetails — what the renderer receives
        </summary>
        <pre className="max-h-64 overflow-auto border-t border-hairline px-3 py-2.5 text-[11px] leading-relaxed text-ink-faint">
          {json}
        </pre>
      </details>
    </Section>
  );
}
