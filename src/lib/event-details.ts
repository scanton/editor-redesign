import type { SchemaSlot } from "./invitation";

/**
 * The dynamic detail catalogue, from the Event Details reference app, merged
 * with the types the editor prototype offered.
 *
 * Each type knows what kind of input it needs, so a date gets a date picker and
 * a dress code gets its options rather than everything being a text box. It
 * also knows where it lands in `invitationDetails`: a named slot for the three
 * the schema calls out, and `customFields` for everything else.
 *
 * Types the panel already owns as fixed fields — event name, hosts, venue,
 * address, start time, and the RSVP block — are deliberately absent. The
 * schema requires them, so they cannot be left to a list you might not add to.
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

/** At most this many details; past it the back panel stops being readable. */
export const MAX_DETAILS = 10;

export const DETAIL_TYPES: DetailType[] = [
  {
    type: "occasionType",
    label: "Occasion type",
    inputKind: "select",
    group: "The event",
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
    group: "The event",
    slot: null,
    onInvitation: true,
  },
  {
    type: "endDateTime",
    label: "End date & time",
    inputKind: "datetime-local",
    group: "The event",
    slot: null,
    onInvitation: true,
  },
  {
    type: "costPerPerson",
    label: "Cost per person",
    inputKind: "text",
    group: "The event",
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
