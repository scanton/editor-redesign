/**
 * The digital card's presentation layer: the scene it sits in, the envelope it
 * arrives in, how it opens, and what the recipient reads first. Catalogue names
 * and counts are the production ones; thumbnails come from the asset service.
 */

export type BackgroundKind = "3D Animation" | "Video BG" | "Stills";

export type Background = {
  id: string;
  label: string;
  kind: BackgroundKind;
  /** Stand-in for the real asset — a scene is motion, not a flat colour. */
  gradient: string;
};

export const BACKGROUNDS: Background[] = [
  { id: "loverain", label: "Love Rain", kind: "3D Animation", gradient: "#ff9ec4, #ff4f7e" },
  { id: "holiday", label: "Holiday", kind: "Stills", gradient: "#1a1030, #c9a227" },
  { id: "partytime", label: "Party Time", kind: "3D Animation", gradient: "#00c2b8, #ffd23f" },
  { id: "winter", label: "Winter", kind: "3D Animation", gradient: "#0d1b3a, #7fb2e5" },
  { id: "autumn", label: "Autumn", kind: "Stills", gradient: "#b2451d, #e8a33d" },
  { id: "suds", label: "Suds", kind: "3D Animation", gradient: "#c98a2a, #f5e2a8" },
  { id: "woodstock", label: "Woodstock", kind: "3D Animation", gradient: "#2fd18b, #b14bd8" },
  { id: "musicfest", label: "Music Fest", kind: "3D Animation", gradient: "#12043a, #ff2d95" },
  { id: "rosegold", label: "Rose Gold Confetti", kind: "Video BG", gradient: "#f7c9b8, #d98b6f" },
  { id: "blue", label: "Liquid Cobalt", kind: "Video BG", gradient: "#1f3fd8, #7fb2e5" },
];

/** Rows as the production panel groups them, with real library counts. */
export const BACKGROUND_ROWS: {
  id: string;
  title: string;
  count: number;
  ids: string[];
  wide?: boolean;
}[] = [
  {
    id: "rec",
    title: "Recommended for this card",
    count: 8,
    ids: ["loverain", "holiday", "partytime", "winter", "autumn", "suds"],
  },
  {
    id: "anim",
    title: "3D Animation · theme × effect",
    count: 64,
    ids: ["woodstock", "musicfest", "suds", "autumn", "winter", "holiday"],
  },
  {
    id: "video",
    title: "Video BG · cinematic",
    count: 450,
    ids: ["rosegold", "blue"],
    wide: true,
  },
];

export const BACKGROUND_TABS: ("All" | BackgroundKind)[] = [
  "All",
  "3D Animation",
  "Video BG",
  "Stills",
];

export const TOTAL_BACKGROUNDS = 450;

export function findBackground(id: string) {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}

/* ─────────────────────────────────────────────── envelope looks ── */

export type EnvelopeLook = {
  id: string;
  label: string;
  /** Envelope body colour; the liner reads as its lighter partner. */
  hex: string;
  liner: string;
};

export const ENVELOPE_LOOK_ROWS: {
  title: string;
  note: string;
  looks: EnvelopeLook[];
}[] = [
  {
    title: "Matched to your card",
    note: "Generated from your artwork",
    looks: [
      { id: "m1", label: "Blush glow", hex: "#f5bdc2", liner: "#fde7ea" },
      { id: "m2", label: "Meadow gold", hex: "#f6f0e2", liner: "#e0cf9a" },
      { id: "m3", label: "Dusk plum", hex: "#c5b4e8", liner: "#ece5fa" },
    ],
  },
  {
    title: "Library",
    note: "Complete sets, one tap each",
    looks: [
      { id: "l1", label: "Anniversary", hex: "#be1d2c", liner: "#f3c9cd" },
      { id: "l2", label: "New Baby", hex: "#9fb0c0", liner: "#e3ebf2" },
      { id: "l3", label: "Tie-Dye", hex: "#c9a94b", liner: "#f2e6c2" },
      { id: "l4", label: "Kids", hex: "#ffffff", liner: "#ffe9a8" },
    ],
  },
];

export const ALL_ENVELOPE_LOOKS = ENVELOPE_LOOK_ROWS.flatMap((r) => r.looks);

export function findEnvelopeLook(id: string | null) {
  return ALL_ENVELOPE_LOOKS.find((l) => l.id === id) ?? null;
}

export const ENVELOPE_COLOURS = [
  "#ffffff",
  "#f6f0e2",
  "#be1d2c",
  "#f5bdc2",
  "#9fb0c0",
  "#c5b4e8",
  "#cfcfcd",
  "#c9a94b",
];

/* ────────────────────────────────────────────────────── reveal ── */

export type RevealPreset = {
  id: string;
  label: string;
  seconds: number;
};

export const REVEAL_PRESETS: RevealPreset[] = [
  { id: "rise", label: "Bottom rise", seconds: 4.5 },
  { id: "flip", label: "Flip open", seconds: 5.2 },
  { id: "slide", label: "Slide out", seconds: 3.8 },
  { id: "fade", label: "Soft fade", seconds: 3.0 },
  { id: "unfold", label: "Unfold", seconds: 6.0 },
];

export type RevealStep = {
  id: string;
  label: string;
  seconds: number;
};

/** The beats of the reveal, in the order they play by default. */
export const REVEAL_STEPS: RevealStep[] = [
  { id: "arrive", label: "Envelope arrives", seconds: 0.8 },
  { id: "seal", label: "Seal breaks", seconds: 0.6 },
  { id: "rise", label: "Card rises", seconds: 1.4 },
  { id: "read", label: "Message reads", seconds: 1.2 },
  { id: "cover", label: "Cover card", seconds: 0.5 },
];

export function findRevealStep(id: string) {
  return REVEAL_STEPS.find((s) => s.id === id)!;
}

/* ─────────────────────────────────────────────────────── cover ── */

export type CoverLayout = "centred" | "stacked" | "minimal" | "avatar-left";

export const COVER_LAYOUTS: { id: CoverLayout; label: string }[] = [
  { id: "centred", label: "Centred" },
  { id: "stacked", label: "Stacked" },
  { id: "minimal", label: "Minimal" },
  { id: "avatar-left", label: "Avatar left" },
];
