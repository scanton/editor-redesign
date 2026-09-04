import type { SchemaSlot } from "./invitation";

/**
 * The dynamic detail catalogue, from the Event Details reference app, merged
 * with the types the editor prototype offered.
 *
 * Each type knows what kind of input it needs, so a date gets a date picker and
 * a dress code gets its options rather than everything being a text box, and
 * where it lands in `invitationDetails` — a named slot, or `customFields`.
 *
 * Every type is a row you can add and remove, the named ones included. An
 * invitation to a thing with no venue, or no fixed time, or no host worth
 * printing, is an ordinary invitation; the schema calling a field required
 * does not make it true of every event. What it does mean is that leaving one
 * out is worth flagging, so it is flagged rather than prevented.
 */
export type DetailInputKind =
  | "text"
  | "textarea"
  | "date"
  | "datetime-local"
  | "url"
  | "select"
  | "schedule"
  | "custom";

export type DetailType = {
  type: string;
  label: string;
  inputKind: DetailInputKind;
  options?: string[];
  /** Only a custom detail can appear more than once. */
  allowMultiple?: boolean;
  /** The named `invitationDetails` field this fills, if any. */
  slot: SchemaSlot | null;
  /** Whether it goes on the artwork by default, or waits on the event page. */
  onInvitation: boolean;
  group: string;
};

/**
 * At most this many details *on the invitation* — past that a back panel stops
 * being readable across a room. Anything kept to the event page is uncapped,
 * because nothing has to fit.
 */
export const MAX_PRINTED = 10;

export const DETAIL_TYPES: DetailType[] = [
  {
    type: "eventName",
    label: "Event name",
    inputKind: "text",
    group: "The event",
    slot: "eventName",
    onInvitation: true,
  },
  {
    type: "tagline",
    label: "Tagline",
    inputKind: "text",
    group: "The event",
    slot: null,
    onInvitation: true,
  },
  {
    type: "hostNames",
    label: "Hosted by",
    inputKind: "text",
    group: "The event",
    slot: "hostNames",
    onInvitation: true,
  },
  {
    type: "eventDate",
    label: "Date",
    inputKind: "text",
    group: "When",
    slot: "date",
    onInvitation: true,
  },
  {
    type: "eventTime",
    label: "Time",
    inputKind: "text",
    group: "When",
    slot: "time",
    onInvitation: true,
  },
  {
    type: "venueName",
    label: "Venue",
    inputKind: "text",
    group: "Where",
    slot: "locationName",
    onInvitation: true,
  },
  {
    type: "venueAddress",
    label: "Address",
    inputKind: "text",
    group: "Where",
    slot: "address",
    onInvitation: true,
  },
  {
    type: "occasionType",
    label: "Occasion type",
    inputKind: "select",
    group: "Also on the event",
    slot: null,
    onInvitation: false,
    options: [
      "Birthday",
      "Wedding",
      "Baby shower",
      "Bridal shower",
      "Graduation",
      "Retirement",
      "Anniversary",
      "Holiday party",
      "Corporate event",
      "Dinner party",
      "Fundraiser",
      "Other",
    ],
  },
  {
    type: "guestOfHonor",
    label: "Guest of honour",
    inputKind: "text",
    group: "Also on the event",
    slot: null,
    onInvitation: true,
  },
  {
    type: "endDateTime",
    label: "End date & time",
    inputKind: "datetime-local",
    group: "When",
    slot: null,
    onInvitation: true,
  },
  {
    type: "costPerPerson",
    label: "Cost per person",
    inputKind: "text",
    group: "Also on the event",
    slot: null,
    onInvitation: true,
  },
  {
    type: "dressCode",
    label: "Dress code",
    inputKind: "select",
    group: "On the day",
    slot: "dresscode",
    onInvitation: true,
    options: [
      "Casual",
      "Smart casual",
      "Cocktail",
      "Semi-formal",
      "Formal",
      "Black tie",
      "White tie",
      "Costume",
      "Theme attire",
      "Other",
    ],
  },
  {
    type: "eventSchedule",
    label: "Schedule",
    inputKind: "schedule",
    group: "On the day",
    slot: "schedule",
    onInvitation: false,
  },
  {
    type: "mealInformation",
    label: "Meal information",
    inputKind: "textarea",
    group: "On the day",
    slot: null,
    onInvitation: false,
  },
  {
    type: "dietaryRestrictions",
    label: "Dietary restrictions",
    inputKind: "textarea",
    group: "On the day",
    slot: null,
    onInvitation: false,
  },
  {
    type: "plusOnePolicy",
    label: "Plus-one policy",
    inputKind: "select",
    group: "On the day",
    slot: null,
    onInvitation: true,
    options: [
      "Plus ones welcome",
      "Named guests only",
      "By invitation only",
      "Ask the host",
      "Other",
    ],
  },
  {
    type: "childrenPolicy",
    label: "Children",
    inputKind: "select",
    group: "On the day",
    slot: null,
    onInvitation: true,
    options: [
      "Children welcome",
      "Adults only",
      "Family-friendly",
      "Ask the host",
      "Other",
    ],
  },
  {
    type: "parkingInstructions",
    label: "Parking",
    inputKind: "textarea",
    group: "Getting there",
    slot: null,
    onInvitation: false,
  },
  {
    type: "arrivalInstructions",
    label: "Arrival",
    inputKind: "textarea",
    group: "Getting there",
    slot: null,
    onInvitation: false,
  },
  {
    type: "entryInstructions",
    label: "Getting in",
    inputKind: "textarea",
    group: "Getting there",
    slot: null,
    onInvitation: false,
  },
  {
    type: "transportationDetails",
    label: "Transport & shuttles",
    inputKind: "textarea",
    group: "Getting there",
    slot: null,
    onInvitation: false,
  },
  {
    type: "accommodations",
    label: "Accommodations",
    inputKind: "textarea",
    group: "Getting there",
    slot: null,
    onInvitation: false,
  },
  {
    type: "accessibilityNote",
    label: "Accessibility",
    inputKind: "textarea",
    group: "Getting there",
    slot: null,
    onInvitation: false,
  },
  {
    type: "giftRegistryUrl",
    label: "Gift registry",
    inputKind: "url",
    group: "Gifts & links",
    slot: null,
    onInvitation: false,
  },
  {
    type: "giftPreference",
    label: "Gift preference",
    inputKind: "text",
    group: "Gifts & links",
    slot: null,
    onInvitation: false,
  },
  {
    type: "websiteUrl",
    label: "Website",
    inputKind: "url",
    group: "Gifts & links",
    slot: null,
    onInvitation: false,
  },
  {
    type: "playlist",
    label: "Playlist",
    inputKind: "url",
    group: "Gifts & links",
    slot: null,
    onInvitation: false,
  },
  {
    type: "socialHashtag",
    label: "Hashtag",
    inputKind: "text",
    group: "Gifts & links",
    slot: null,
    onInvitation: true,
  },
  {
    type: "weatherOutdoorNote",
    label: "Weather & outdoors",
    inputKind: "textarea",
    group: "Notes",
    slot: null,
    onInvitation: false,
  },
  {
    type: "specialNote",
    label: "Note to guests",
    inputKind: "textarea",
    group: "Notes",
    slot: "instructions",
    onInvitation: false,
  },
  {
    type: "custom",
    label: "Something else",
    inputKind: "custom",
    group: "Notes",
    slot: null,
    onInvitation: true,
    allowMultiple: true,
  },
];

export const DETAIL_TYPE_BY_ID = new Map(
  DETAIL_TYPES.map((detail) => [detail.type, detail]),
);

export function findDetailType(type: string) {
  return DETAIL_TYPE_BY_ID.get(type) ?? null;
}

/** Groups in catalogue order, for the type dropdown. */
export const DETAIL_GROUPS = DETAIL_TYPES.reduce<string[]>((groups, detail) => {
  if (!groups.includes(detail.group)) groups.push(detail.group);
  return groups;
}, []);

/**
 * A row in the Event panel. `type` is empty on the trailing blank row the form
 * always keeps, which is what lets the list grow without an Add button.
 */
export type DetailRow = {
  id: string;
  type: string;
  value: string;
  /** Only meaningful on a custom row. */
  customLabel?: string;
  /** The eye toggle: printed on the invitation, or event page only. */
  onInvitation: boolean;
};

/** What a row is called — its type's name, or whatever a custom row was named. */
export function labelOf(row: DetailRow) {
  if (row.type === "custom") return row.customLabel?.trim() || "Custom detail";
  return findDetailType(row.type)?.label ?? row.type;
}

/** Rows that have been given a type and something to say. */
export function filledRows(rows: DetailRow[]) {
  return rows.filter((r) => r.type && (r.value.trim() || r.type === "eventSchedule"));
}

/** Rows that will be rendered into the artwork. */
export function printedRows(rows: DetailRow[]) {
  return filledRows(rows).filter((r) => r.onInvitation);
}

/** What one type currently says, wherever it sits in the list. */
export function valueOfType(rows: DetailRow[], type: string) {
  return rows.find((r) => r.type === type)?.value.trim() ?? "";
}

/** Whether a type is in the list at all — removed fields simply are not. */
export function hasType(rows: DetailRow[], type: string) {
  return rows.some((r) => r.type === type);
}

const ORDER = new Map(DETAIL_TYPES.map((t, i) => [t.type, i]));

/**
 * Where a newly typed row belongs. Rows sort into catalogue order rather than
 * landing wherever they were added, so removing Date and putting it back does
 * not leave it stranded at the bottom of the invitation.
 */
export function sortRows(rows: DetailRow[]) {
  return [...rows].sort(
    (a, b) => (ORDER.get(a.type) ?? 999) - (ORDER.get(b.type) ?? 999),
  );
}

/** A starting invitation: the fields most events actually print. */
export const SEED_TYPES = [
  "eventName",
  "tagline",
  "hostNames",
  "eventDate",
  "eventTime",
  "venueName",
  "venueAddress",
  "dressCode",
];
