import { GRADIENT_STYLES } from "./gradient-styles";
import { PALETTES } from "./gradient-palettes";
import {
  THEME_COMBINATIONS,
  describeTheme,
  matchPreset,
} from "./themes";
import { VIDEO_BACKGROUNDS, findVideoBackground } from "./video-backgrounds";

/**
 * The digital card's presentation layer: the scene it sits in, the envelope it
 * arrives in, how it opens, and what the recipient reads first. Catalogue names
 * and counts are the production ones; thumbnails come from the asset service.
 */

/**
 * A scene is one of four kinds. Gradients and themes are generated, so they are
 * described by their parameters rather than picked from a fixed list; video and
 * stills come from the asset library.
 */
export type BackgroundKind = "Video" | "Animation" | "Gradient" | "Stills";

export type Scene =
  | { kind: "Gradient"; styleId: string; paletteId: string; speed: number }
  | { kind: "Animation"; themeId: string; effectId: string | null; speed: number }
  | { kind: "Video"; id: string }
  | { kind: "Stills"; id: string };

/** Stills are flat images; the library currently ships two. */
export const STILL_SCENES: { id: string; label: string; gradient: string }[] = [
  { id: "holiday", label: "Holiday", gradient: "#1a1030, #c9a227" },
  { id: "autumn", label: "Autumn", gradient: "#b2451d, #e8a33d" },
];

/** Ordered as the panel presents them. */
export const BACKGROUND_TABS: ("All" | BackgroundKind)[] = [
  "All",
  "Video",
  "Animation",
  "Gradient",
  "Stills",
];

export const SCENE_COUNTS = {
  video: VIDEO_BACKGROUNDS.length,
  themes: THEME_COMBINATIONS,
  gradient: GRADIENT_STYLES.length * PALETTES.length,
  stills: STILL_SCENES.length,
};

export const TOTAL_BACKGROUNDS =
  SCENE_COUNTS.video +
  SCENE_COUNTS.themes +
  SCENE_COUNTS.gradient +
  SCENE_COUNTS.stills;

/**
 * What we lead with. In production this is driven by the card's occasion and
 * palette; here it is a hand-picked spread so the row shows all three kinds.
 */
export const RECOMMENDED: Scene[] = [
  { kind: "Video", id: "graduation-cap-toss-gold" },
  { kind: "Animation", themeId: "confetti", effectId: "balloons", speed: 60 },
  { kind: "Gradient", styleId: "aurora", paletteId: "northern-lights", speed: 12 },
  { kind: "Video", id: "celebration-edm-rave-festival" },
  { kind: "Animation", themeId: "starfield", effectId: "magic-dust", speed: 60 },
  { kind: "Video", id: "anniversary-rose-gold-confetti" },
  { kind: "Gradient", styleId: "halo", paletteId: "golden-hour", speed: 12 },
  { kind: "Video", id: "birthday-neon-party-glow" },
  { kind: "Animation", themeId: "tie-dye", effectId: "butterflies", speed: 60 },
];

export function findStill(id: string) {
  return STILL_SCENES.find((s) => s.id === id) ?? STILL_SCENES[0];
}

/** Stable key for a scene, so a mixed list can compare selections. */
export function sceneKey(scene: Scene): string {
  if (scene.kind === "Gradient") return `gradient:${scene.styleId}:${scene.paletteId}`;
  if (scene.kind === "Animation") return `animation:${scene.themeId}:${scene.effectId ?? "none"}`;
  return `${scene.kind.toLowerCase()}:${scene.id}`;
}

/** One-line description of whatever scene is set. */
export function describeScene(scene: Scene): string {
  if (scene.kind === "Gradient") {
    const style = GRADIENT_STYLES.find((s) => s.id === scene.styleId);
    const palette = PALETTES.find((p) => p.id === scene.paletteId);
    return `${style?.name ?? "Gradient"} · ${palette?.name ?? ""}`;
  }
  if (scene.kind === "Animation") {
    return (
      matchPreset(scene.themeId, scene.effectId)?.label ??
      describeTheme(scene.themeId, scene.effectId)
    );
  }
  if (scene.kind === "Video") return findVideoBackground(scene.id).label;
  return findStill(scene.id).label;
}

/* ─────────────────────────────────────────────── envelope looks ── */

export type EnvelopeLook = {
  id: string;
  label: string;
  /** Envelope body colour; the liner reads as its lighter partner. */
  hex: string;
  liner: string;
  /** The liner asset a matched set dresses the envelope with. */
  linerId: string;
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
      { id: "m1", label: "Blush glow", hex: "#f5bdc2", liner: "#fde7ea", linerId: "baby" },
      { id: "m2", label: "Meadow gold", hex: "#f6f0e2", liner: "#e0cf9a", linerId: "anniversary" },
      { id: "m3", label: "Dusk plum", hex: "#c5b4e8", liner: "#ece5fa", linerId: "tiedye" },
    ],
  },
  {
    title: "Library",
    note: "Complete sets, one tap each",
    looks: [
      { id: "l1", label: "Anniversary", hex: "#be1d2c", liner: "#f3c9cd", linerId: "anniversary" },
      { id: "l2", label: "New Baby", hex: "#9fb0c0", liner: "#e3ebf2", linerId: "baby" },
      { id: "l3", label: "Tie-Dye", hex: "#c9a94b", liner: "#f2e6c2", linerId: "tiedye" },
      { id: "l4", label: "Kids", hex: "#ffffff", liner: "#ffe9a8", linerId: "kids" },
    ],
  },
];

export const ALL_ENVELOPE_LOOKS = ENVELOPE_LOOK_ROWS.flatMap((r) => r.looks);

export function findEnvelopeLook(id: string | null) {
  return ALL_ENVELOPE_LOOKS.find((l) => l.id === id) ?? null;
}

/**
 * The envelope is dressed in three parts. Each is browsed by row the way the
 * production panel groups them; the counts are the library's, the four assets
 * per part are what the current set ships.
 */
export type EnvelopeDecorPart = "liner" | "stamp" | "seal";

export type DecorAsset = {
  id: string;
  label: string;
  /** Stand-in artwork until the real swatches are wired up. */
  swatch: string;
};

const LINERS: DecorAsset[] = [
  {
    id: "tiedye",
    label: "Tie Dye",
    swatch:
      "conic-gradient(from 210deg, #7fd6ff, #c9a8ff, #ffb3d9, #ffe08a, #9be7c4, #7fd6ff)",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    swatch:
      "radial-gradient(circle at 30% 30%, #f7d9c4 0 18%, transparent 19%), radial-gradient(circle at 72% 68%, #eec3a8 0 14%, transparent 15%), linear-gradient(160deg, #fbeee2, #f2ddc9)",
  },
  {
    id: "baby",
    label: "Baby",
    swatch:
      "radial-gradient(circle at 25% 35%, #ffd0e0 0 16%, transparent 17%), radial-gradient(circle at 70% 72%, #ffc0d6 0 12%, transparent 13%), linear-gradient(160deg, #fff2f6, #ffe3ee)",
  },
  {
    id: "kids",
    label: "Kids",
    swatch:
      "radial-gradient(circle at 28% 30%, #ffd166 0 10%, transparent 11%), radial-gradient(circle at 68% 66%, #7fd6ff 0 9%, transparent 10%), linear-gradient(160deg, #2b2170, #4b3bb0)",
  },
];

const STAMPS: DecorAsset[] = [
  { id: "classic", label: "Classic", swatch: "linear-gradient(150deg, #f2e8d5, #cbb98f)" },
  { id: "botanical", label: "Botanical", swatch: "linear-gradient(150deg, #dbe9d2, #6f9366)" },
  { id: "heart", label: "Heart", swatch: "linear-gradient(150deg, #ffd7de, #d4536b)" },
  { id: "vintage", label: "Vintage", swatch: "linear-gradient(150deg, #e6d3b3, #8a6b46)" },
];

const SEALS: DecorAsset[] = [
  { id: "wax-red", label: "Wax red", swatch: "radial-gradient(circle at 38% 34%, #e0525f, #8c1420 70%)" },
  { id: "wax-cream", label: "Wax cream", swatch: "radial-gradient(circle at 38% 34%, #f6ecd8, #c2a875 70%)" },
  { id: "monogram", label: "Monogram", swatch: "radial-gradient(circle at 38% 34%, #3b3b56, #17172a 70%)" },
  { id: "foil", label: "Foil", swatch: "radial-gradient(circle at 38% 34%, #f8e6a8, #b08d2f 70%)" },
];

export const ENVELOPE_DECOR: Record<
  EnvelopeDecorPart,
  { assets: DecorAsset[]; rows: { title: string; count: number; order: number[] }[] }
> = {
  liner: {
    assets: LINERS,
    rows: [
      { title: "Popular", count: 14, order: [0, 1, 2, 3] },
      { title: "By occasion", count: 38, order: [1, 2, 3, 0] },
      { title: "Pattern", count: 22, order: [0, 3, 1, 2] },
    ],
  },
  stamp: {
    assets: STAMPS,
    rows: [
      { title: "Popular", count: 9, order: [0, 1, 2, 3] },
      { title: "Classic post", count: 12, order: [3, 0, 1, 2] },
    ],
  },
  seal: {
    assets: SEALS,
    rows: [
      { title: "Popular", count: 11, order: [0, 1, 2, 3] },
      { title: "Monogram", count: 26, order: [2, 3, 0, 1] },
    ],
  },
};

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
