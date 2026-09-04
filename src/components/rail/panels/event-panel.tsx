"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Info, Trash2, X } from "lucide-react";
import {
  Field,
  PanelBody,
  Section,
  Segmented,
  Select,
  Toggle,
  inputClass,
} from "@/components/rail/panels/parts";
import { springTight, staggerParent } from "@/lib/motion";
import {
  DETAIL_TYPES,
  MAX_PRINTED,
  findDetailType,
  labelOf,
  printedRows,
  type DetailRow,
  type DetailType,
} from "@/lib/event-details";
import {
  QR_SHAPES,
  RSVP_METHODS,
  buildInvitationDetails,
  type RsvpMethod,
} from "@/lib/invitation";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * Where an invitation differs from a greeting card. A card is written; an
 * invitation is described — these fields are the data the image model bakes
 * into the back panel, not text you edit on the canvas.
 *
 * Nothing is fixed. A gathering with no venue, or no set time, or no host
 * worth printing is an ordinary invitation, so every field is a row that can
 * be taken out and put back. What the schema calls required is reported as
 * unfinished work rather than enforced as a wall.
 *
 * The eye on each row is the other load-bearing control: everything here is
 * collected and reaches the event page, and the eye decides which of it is
 * also printed.
 */
export function EventPanel() {
  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <p className="text-[12.5px] leading-snug text-ink-faint">
            Your invitation re-renders from these details — the words are part of
            the artwork, not a layer on top of it. Every field is optional; keep
            the ones this event actually has.
          </p>
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

/**
 * The dynamic detail list. A row is generic until it is given a type, and the
 * type decides what the input is — a date picker for a date, options for a
 * dress code, a label-and-value pair for something the catalogue has no name
 * for. The list always ends in one blank row, so it grows as it is filled
 * rather than waiting behind an Add button.
 */
function MoreDetails() {
  const details = useEditorStore((s) => s.invitation.details);
  const typed = details.filter((d) => d.type);
  const printed = printedRows(details).length;
  const full = printed >= MAX_PRINTED;

  // Everything but a custom row is offered once.
  const used = new Set(typed.map((d) => d.type));

  return (
    <Section
      title="Details"
      action={
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums",
            full ? "bg-brand-red/10 text-brand-red" : "bg-surface-sunken text-ink-faint",
          )}
        >
          {printed} / {MAX_PRINTED} printed
        </span>
      }
    >
      <p className="mb-3 text-[12.5px] leading-snug text-ink-faint">
        The eye chooses what renders on the invitation. Hidden fields are still
        collected — they just live on your event page, and they do not count
        against what has to fit.
      </p>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {details.map((row) => (
            <DetailRow key={row.id} row={row} used={used} />
          ))}
        </AnimatePresence>
      </div>

      {full && (
        <p className="mt-2.5 text-[12px] leading-snug text-ink-faint">
          That is the most a back panel can hold and still be read across a
          room. Remove one, or close an eye to keep it to the event page.
        </p>
      )}
    </Section>
  );
}

function DetailRow({ row, used }: { row: DetailRow; used: Set<string> }) {
  const setDetailType = useEditorStore((s) => s.setDetailType);
  const updateDetail = useEditorStore((s) => s.updateDetail);
  const removeDetail = useEditorStore((s) => s.removeDetail);

  const definition = findDetailType(row.type);
  const blank = !row.type;
  const shown = row.onInvitation;

  const typeOptions = DETAIL_TYPES.map((t) => ({
    value: t.type,
    label: t.label,
    group: t.group,
    disabled: !t.allowMultiple && t.type !== row.type && used.has(t.type),
  }));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: -10 }}
      transition={springTight}
      className={cn(
        "rounded-[14px] border p-2.5",
        blank ? "border-dashed border-hairline-strong" : "border-hairline",
      )}
    >
      <div className="flex items-center gap-1.5">
        <Select
          className="min-w-0 flex-1"
          placeholder="Add a detail…"
          options={typeOptions}
          value={row.type}
          onChange={(type) => setDetailType(row.id, type)}
        />

        {!blank && (
          <>
            <button
              type="button"
              aria-pressed={shown}
              title={shown ? "Shown on the invitation" : "Event page only"}
              onClick={() => updateDetail(row.id, { onInvitation: !shown })}
              className={cn(
                "shrink-0 rounded-full p-1.5 transition-colors",
                shown
                  ? "text-ink hover:bg-surface-sunken"
                  : "text-ink-faint hover:text-ink-soft",
              )}
            >
              {shown ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              type="button"
              aria-label={`Remove ${labelOf(row)}`}
              onClick={() => removeDetail(row.id)}
              className="shrink-0 rounded-full p-1.5 text-ink-faint hover:text-brand-red"
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>

      {definition && (
        <div className="mt-2">
          <DetailInput row={row} definition={definition} />
          {!shown && (
            <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
              Event page only
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

/** The input a type asks for. */
function DetailInput({
  row,
  definition,
}: {
  row: DetailRow;
  definition: DetailType;
}) {
  const updateDetail = useEditorStore((s) => s.updateDetail);
  const set = (patch: Partial<DetailRow>) => updateDetail(row.id, patch);

  if (definition.inputKind === "schedule") return <ScheduleRows />;

  if (definition.inputKind === "custom") {
    return (
      <div className="flex flex-col gap-2">
        <input
          className={inputClass}
          placeholder="What to call it"
          value={row.customLabel ?? ""}
          onChange={(e) => set({ customLabel: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="What it says"
          value={row.value}
          onChange={(e) => set({ value: e.target.value })}
        />
      </div>
    );
  }

  if (definition.inputKind === "select") {
    return (
      <Select
        placeholder={`Choose a ${definition.label.toLowerCase()}`}
        options={(definition.options ?? []).map((o) => ({ value: o, label: o }))}
        value={row.value}
        onChange={(value) => set({ value })}
      />
    );
  }

  if (definition.inputKind === "textarea") {
    return (
      <textarea
        className={cn(inputClass, "min-h-[72px] resize-y")}
        placeholder={definition.label}
        value={row.value}
        onChange={(e) => set({ value: e.target.value })}
      />
    );
  }

  return (
    <input
      className={inputClass}
      type={definition.inputKind}
      placeholder={
        definition.inputKind === "url" ? "https://" : definition.label
      }
      value={row.value}
      onChange={(e) => set({ value: e.target.value })}
    />
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
        <div key={i} className="flex items-center gap-1.5">
          <input
            className={cn(inputClass, "w-[86px] shrink-0")}
            placeholder="9:00 PM"
            value={row.time}
            onChange={(e) => patch(i, { time: e.target.value })}
          />
          <input
            className={cn(inputClass, "min-w-0 flex-1")}
            placeholder="Doors open"
            value={row.item}
            onChange={(e) => patch(i, { item: e.target.value })}
          />
          <button
            type="button"
            aria-label="Remove line"
            disabled={rows.length === 1}
            onClick={() => setSchedule(rows.filter((_, j) => j !== i))}
            className="shrink-0 rounded-full p-1.5 text-ink-faint hover:text-brand-red disabled:opacity-30"
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
