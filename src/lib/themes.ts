import { EFFECTS, VARIATIONS } from "./themes-registry";

/**
 * Scene presets from html5-themes. A scene is a background variation with a
 * sprite effect over it; these orderings mirror the arrays in the library's
 * own app.js so the preset indices below stay meaningful.
 *
 * Three variations (Halloween, Cherry Blossoms, Underwater) and one effect
 * (Moon Phases) exist in the repo but are not in its shipped line-up, so they
 * are absent here too.
 */
const VARIATION_ORDER = [
  "dreamy-blobs", "lava-lamp", "aurora", "liquid-metal", "sunset-drift",
  "ocean-depths", "neon-city", "smoke", "candy", "northern-fire",
  "pool-water", "snowfall", "beer", "tie-dye", "hearts",
  "christmas", "fireworks", "confetti", "autumn-leaves", "starfield",
  "candlelight", "rainbow-rays", "bokeh", "stage-lights", "koi-pond",
  "deep-ocean", "unicorn-sky", "rain-on-glass", "nebula",
];

const EFFECT_ORDER = [
  "bubbles", "hearts", "snowflakes", "stars", "balloons",
  "confetti", "ribbons", "magic-dust", "fireflies", "butterflies",
  "cherry-blossoms", "dandelion-seeds", "crystal-shards", "spell-runes",
  "jack-sparks", "comets", "geometric", "music-notes", "paper-planes",
  "autumn-leaves", "rose-petals", "skulls", "hemp-leaves", "koi-fish",
  "jellyfish", "rockets", "fairies", "umbrellas", "astronauts",
];

/** Only the variations and effects the library actually ships. */
export const THEME_VARIATIONS = VARIATION_ORDER.map(
  (id) => VARIATIONS.find((v) => v.id === id)!,
).filter(Boolean);

export const THEME_EFFECTS = EFFECT_ORDER.map(
  (id) => EFFECTS.find((e) => e.id === id)!,
).filter(Boolean);

export const THEME_COUNT = THEME_VARIATIONS.length;
export const EFFECT_COUNT = THEME_EFFECTS.length;
/** Every pairing, plus every background with no effect over it. */
export const THEME_COMBINATIONS = THEME_COUNT * (EFFECT_COUNT + 1);

export type ThemePreset = {
  id: string;
  label: string;
  themeId: string;
  effectId: string | null;
};

/** [name, variation index, effect index] — indices as the library defines them. */
const PRESET_DEFS: [string, number, number][] = [
  ["Woodstock", 14, 10],
  ["Love Rain", 15, 2],
  ["Music Festival", 17, 18],
  ["Winter", 12, 3],
  ["Suds", 13, 1],
  ["Holiday", 16, 4],
  ["Party Time", 18, 5],
  ["Autumn Leaves", 19, 20],
  ["Blossom Pool", 11, 11],
  ["Magic Spell", 10, 14],
  ["Stardust", 20, 8],
  ["Cosmic Ether", 22, 15],
  ["Candy Rain", 9, 6],
  ["Will-o-Wisp", 8, 9],
  ["Neon Stars", 7, 16],
  ["Geometry Pool", 6, 17],
  ["Sunset Sparkle", 5, 8],
  ["Liquid Stars", 4, 4],
  ["Northern Lights", 3, 18],
  ["Molten Lava", 2, 9],
  ["Dream Seeds", 1, 12],
  ["Broken World", 8, 13],
  ["Christmas Snow", 16, 3],
  ["First Dance", 23, 21],
  ["Headbanger", 24, 22],
  ["Session", 14, 23],
  ["Zen Garden", 25, 24],
  ["Deep Sea", 26, 25],
  ["Blast Off", 20, 26],
  ["Fairy Garden", 27, 27],
  ["Stormy Night", 28, 28],
  ["Spacewalk", 29, 29],
];

export const THEME_PRESETS: ThemePreset[] = PRESET_DEFS.map(
  ([label, bg, sprite]) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    // The library's arrays are 1-based here: index 0 is "none".
    themeId: VARIATION_ORDER[bg - 1],
    effectId: sprite === 0 ? null : EFFECT_ORDER[sprite - 1],
  }),
);

export function variationLabel(id: string) {
  return THEME_VARIATIONS.find((v) => v.id === id)?.label ?? id;
}

export function effectLabel(id: string | null) {
  if (!id) return "None";
  return THEME_EFFECTS.find((e) => e.id === id)?.label ?? id;
}

/** The preset matching this pairing, if there is one. */
export function matchPreset(themeId: string, effectId: string | null) {
  return (
    THEME_PRESETS.find(
      (p) => p.themeId === themeId && p.effectId === effectId,
    ) ?? null
  );
}

export function describeTheme(themeId: string, effectId: string | null) {
  return `${variationLabel(themeId)} + ${effectLabel(effectId)}`;
}

/** Stand-in tint for a tile before its scene is mounted. */
export function themeTint(themeId: string) {
  let hash = 0;
  const label = variationLabel(themeId);
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) % 360;
  }
  return `linear-gradient(150deg, hsl(${hash} 55% 46%), hsl(${(hash + 48) % 360} 62% 24%))`;
}
