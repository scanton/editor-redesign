import type { CardDoc, Orientation } from "./types";

/**
 * Invitations are A7 — a 5x7 trim in portrait, 7x5 in landscape. Two panels,
 * front and back, with no inside: the fold a greeting card is built around
 * does not exist here.
 *
 * The faces carry the trim's true proportions at the same 211ppi the card
 * artwork renders at, so print geometry is shared between the two products.
 * The artwork we have is portrait at 784x1168, which is not quite 5:7, so it
 * is centre-cropped into the frame rather than stretched to it.
 */
export const INVITATION_PPI = 211.2;
export const INVITATION_SHORT = 1056; // 5in
export const INVITATION_LONG = 1478; // 7in

export function invitationSize(orientation: Orientation) {
  return orientation === "portrait"
    ? { width: INVITATION_SHORT, height: INVITATION_LONG }
    : { width: INVITATION_LONG, height: INVITATION_SHORT };
}

/* ------------------------------------------------------------------ schema */

/**
 * The renderer's contract, from the implementation plan. Everything the Event
 * panel collects assembles into this — it is the reason the panel is shaped
 * the way it is rather than being a free-form list of fields.
 */
export type RsvpMethod = "phone" | "url" | "email";

export type InvitationDetails = {
  eventName: string;
  hostNames: string[];
  date: string;
  time: string;
  locationName: string;
  address: string;
  rsvpMethod: RsvpMethod;
  rsvpValue: string;
  rsvpDeadline: string | null;
  dresscode: string | null;
  instructions: string | null;
  schedule: { time: string; item: string }[];
  customFields: { label: string; value: string }[];
};

/**
 * Optional fields the schema names outright. A detail bound to one of these
 * fills its slot; anything else lands in `customFields`.
 */
export type SchemaSlot = "dresscode" | "instructions" | "schedule";

/**
 * One row in "More details". `onInvitation` is the eye toggle: on means the
 * image model bakes it into the back panel, off means it lives on the event
 * page only. Both are collected either way — the toggle decides what gets
 * printed, not what gets stored.
 */
export type EventDetail = {
  id: string;
  label: string;
  value: string;
  onInvitation: boolean;
  /** Which named schema field this fills, or null for a custom field. */
  slot: SchemaSlot | null;
};

/** Rows in a schedule detail, kept as text so the demo stays editable. */
export type ScheduleRow = { time: string; item: string };

/* ------------------------------------------------------------- suggestions */

export type DetailSuggestion = {
  label: string;
  slot: SchemaSlot | null;
  /** Whether it lands on the artwork by default. */
  onInvitation: boolean;
  hint: string;
};

/**
 * What "+ Add a detail" offers. The first three fill named schema slots; the
 * rest become custom fields. Defaults follow what usually belongs in print —
 * a dress code goes on the card, parking notes do not.
 */
export const DETAIL_SUGGESTIONS: DetailSuggestion[] = [
  { label: "Dress code", slot: "dresscode", onInvitation: true, hint: "Schema field" },
  { label: "Note to guests", slot: "instructions", onInvitation: false, hint: "Schema field" },
  { label: "Schedule", slot: "schedule", onInvitation: false, hint: "Schema field" },
  { label: "Cost per person", slot: null, onInvitation: true, hint: "Custom field" },
  { label: "Registry", slot: null, onInvitation: false, hint: "Custom field" },
  { label: "Playlist", slot: null, onInvitation: false, hint: "Custom field" },
  { label: "Food situation", slot: null, onInvitation: false, hint: "Custom field" },
  { label: "Parking", slot: null, onInvitation: false, hint: "Custom field" },
  { label: "Accommodations", slot: null, onInvitation: false, hint: "Custom field" },
  { label: "Website", slot: null, onInvitation: false, hint: "Custom field" },
];

export const RSVP_METHODS: { value: RsvpMethod; label: string; placeholder: string }[] = [
  { value: "url", label: "Link", placeholder: "hstmp.co/funeral-youth" },
  { value: "email", label: "Email", placeholder: "rsvp@example.com" },
  { value: "phone", label: "Phone", placeholder: "(555) 019-2847" },
];

/* ------------------------------------------------------------- the QR code */

/** Offered shapes for the code itself — the design has to live with it. */
export const QR_SHAPES: { value: QrShape; label: string; radius: number }[] = [
  { value: "square", label: "Square", radius: 0 },
  { value: "rounded", label: "Rounded", radius: 22 },
  { value: "circle", label: "Circle", radius: 999 },
];

export type QrShape = "square" | "rounded" | "circle";

/**
 * Where the code sits, as a fraction of the panel, so it survives an
 * orientation change. Bottom-right is the placement the print spec calls for.
 */
export const DEFAULT_QR = { x: 0.78, y: 0.84, width: 0.2 };

/** Clamp keeps the whole code on the panel, whatever it was dragged toward. */
export function clampQr(pos: { x: number; y: number }, width: number) {
  const half = width / 2;
  const edge = 0.02;
  const lo = half + edge;
  const hi = 1 - half - edge;
  return {
    x: Math.max(lo, Math.min(hi, pos.x)),
    y: Math.max(lo, Math.min(hi, pos.y)),
  };
}

/* ---------------------------------------------------------------- the card */

export const INVITATION_ARTWORK = {
  front: "/images/invitation-front.jpg",
  back: "/images/invitation-back.png",
};

export const QR_IMAGE = "/images/invitation-qr.png";

/**
 * The invitation the editor opens on. Like the greeting card, the artwork is a
 * finished render with its type already baked in — which is exactly why the
 * event details are collected as data and re-rendered rather than edited as
 * text nodes on the canvas.
 */
export function invitationDoc(orientation: Orientation): CardDoc {
  const size = invitationSize(orientation);
  return {
    id: "inv_funeral_for_my_youth",
    title: "The Funeral for My Youth",
    faces: {
      front: {
        id: "front",
        label: "Front",
        ...size,
        background: "#c8e814",
        segments: [
          {
            // Two lines of cut-out lettering, so the outline steps in for the
            // narrower first line rather than boxing both.
            id: "inv_front_type_seg",
            label: "Headline type",
            points: [
              0.27, 0.35, 0.73, 0.35, 0.73, 0.48, 0.92, 0.48, 0.92, 0.59,
              0.13, 0.59, 0.13, 0.48, 0.27, 0.48,
            ].map(scale(size)),
          },
          {
            id: "inv_front_hat_seg",
            label: "Party hat",
            points: [
              0.24, 0.06, 0.3, 0.06, 0.58, 0.29, 0.56, 0.33, 0.46, 0.34,
              0.24, 0.24, 0.19, 0.14,
            ].map(scale(size)),
          },
          {
            id: "inv_front_skull_seg",
            label: "Skull",
            points: [
              0.22, 0.33, 0.4, 0.28, 0.6, 0.28, 0.79, 0.36, 0.86, 0.52,
              0.82, 0.68, 0.7, 0.79, 0.62, 0.87, 0.44, 0.88, 0.32, 0.79,
              0.2, 0.66, 0.16, 0.5,
            ].map(scale(size)),
          },
          {
            id: "inv_front_torn_seg",
            label: "Torn paper backdrop",
            points: [0, 0, 1, 0, 1, 1, 0, 1].map(scale(size)),
          },
        ],
        nodes: [
          {
            id: "inv_front_art",
            kind: "image",
            name: "Front artwork",
            src: INVITATION_ARTWORK.front,
            x: 0,
            y: 0,
            width: size.width,
            height: size.height,
            scaleX: 1,
            scaleY: 1,
            fit: "cover",
            rotation: 0,
            opacity: 1,
            locked: true,
          },
        ],
      },
      back: {
        id: "back",
        label: "Back",
        ...size,
        background: "#101010",
        segments: [
          {
            id: "inv_back_details_seg",
            label: "Event details",
            points: [0.04, 0.39, 0.96, 0.39, 0.96, 0.72, 0.04, 0.72].map(
              scale(size),
            ),
          },
          {
            id: "inv_back_heart_seg",
            label: "Neon heart",
            points: [0.41, 0.26, 0.59, 0.26, 0.59, 0.37, 0.41, 0.37].map(
              scale(size),
            ),
          },
          {
            id: "inv_back_torn_seg",
            label: "Torn paper backdrop",
            points: [0, 0, 1, 0, 1, 1, 0, 1].map(scale(size)),
          },
        ],
        nodes: [
          {
            id: "inv_back_art",
            kind: "image",
            name: "Back artwork",
            src: INVITATION_ARTWORK.back,
            x: 0,
            y: 0,
            width: size.width,
            height: size.height,
            scaleX: 1,
            scaleY: 1,
            fit: "cover",
            rotation: 0,
            opacity: 1,
            locked: true,
          },
        ],
      },
      // An invitation has no inside. The face exists so the document type is
      // shared with greeting cards, and the switcher never offers it.
      inside: {
        id: "inside",
        label: "Inside",
        ...size,
        background: "#101010",
        nodes: [],
      },
    },
  };
}

/** Segment outlines are authored as fractions so they follow the trim. */
function scale(size: { width: number; height: number }) {
  return (n: number, i: number) =>
    Math.round(n * (i % 2 === 0 ? size.width : size.height));
}

/** Faces the switcher offers, per product. */
export const INVITATION_FACES = ["front", "back"] as const;

/* ----------------------------------------------------------- the payload */

/** Everything the Event panel collects, in the shape the store holds it. */
export type InvitationInput = {
  eventName: string;
  tagline: string;
  hosts: string;
  date: string;
  time: string;
  locationName: string;
  address: string;
  details: EventDetail[];
  schedule: ScheduleRow[];
  rsvpOn: boolean;
  rsvpMethod: RsvpMethod;
  rsvpValue: string;
  rsvpDeadline: string;
  rsvpLine: string;
};

/**
 * Assemble the `invitationDetails` block the creation queue accepts.
 *
 * This is the render payload, so it carries only what is meant to be printed —
 * a detail with its eye closed is still collected, but it belongs to the event
 * page and never reaches the image model. The schema has no per-field
 * visibility flag, so the filter has to happen here; worth raising with the
 * team, since the alternative is the model deciding what to leave out.
 *
 * Two strings the artwork carries have no named slot either — the tagline and
 * the RSVP line — so they travel as custom fields. Also worth raising: they
 * are rendered text, not loose metadata, and the layout archetype has to know
 * where to put them.
 */
export function buildInvitationDetails(inv: InvitationInput): InvitationDetails {
  const printed = inv.details.filter((d) => d.onInvitation);

  const slotValue = (slot: SchemaSlot) =>
    printed.find((d) => d.slot === slot && d.value.trim())?.value.trim() ?? null;

  const custom: { label: string; value: string }[] = [];
  if (inv.tagline.trim())
    custom.push({ label: "tagline", value: inv.tagline.trim() });
  if (inv.rsvpOn && inv.rsvpLine.trim())
    custom.push({ label: "rsvpLine", value: inv.rsvpLine.trim() });
  for (const d of printed)
    if (!d.slot && d.value.trim())
      custom.push({ label: d.label, value: d.value.trim() });

  const hasSchedule = printed.some((d) => d.slot === "schedule");

  return {
    eventName: inv.eventName.trim(),
    hostNames: inv.hosts
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean),
    date: inv.date.trim(),
    time: inv.time.trim(),
    locationName: inv.locationName.trim(),
    address: inv.address.trim(),
    rsvpMethod: inv.rsvpMethod,
    rsvpValue: inv.rsvpValue.trim(),
    rsvpDeadline: inv.rsvpOn ? inv.rsvpDeadline.trim() || null : null,
    dresscode: slotValue("dresscode"),
    instructions: slotValue("instructions"),
    schedule: hasSchedule
      ? inv.schedule.filter((r) => r.time.trim() || r.item.trim())
      : [],
    customFields: custom,
  };
}

/** Required fields the schema will not accept as blank. */
export function missingRequired(inv: InvitationInput): string[] {
  const d = buildInvitationDetails(inv);
  const gaps: string[] = [];
  if (!d.eventName) gaps.push("Event name");
  if (d.hostNames.length === 0) gaps.push("Hosts");
  if (!d.date) gaps.push("Date");
  if (!d.time) gaps.push("Time");
  if (!d.locationName) gaps.push("Venue");
  if (!d.address) gaps.push("Address");
  if (inv.rsvpOn && !d.rsvpValue) gaps.push("RSVP destination");
  return gaps;
}
