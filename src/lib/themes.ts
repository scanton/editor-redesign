/**
 * Animated scenes from the html5-themes engine. A scene is a background
 * variation composited with a sprite effect — 29 backgrounds × 30 effects — and
 * these are the named presets the library ships.
 */
export type Theme = {
  id: string;
  label: string;
  /** The background variation. */
  theme: string;
  /** The sprite layer over it. */
  effect: string;
};

const t = (label: string, theme: string, effect: string): Theme => ({
  id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  label,
  theme,
  effect,
});

export const THEMES: Theme[] = [
  t("Woodstock", "Tie Dye", "Butterflies"),
  t("Love Rain", "Hearts", "Hearts"),
  t("Music Festival", "Fireworks", "Music Notes"),
  t("Winter", "Snowfall", "Snowflakes"),
  t("Suds", "Beer", "Bubbles"),
  t("Holiday", "Christmas", "Stars & Sparkles"),
  t("Party Time", "Confetti", "Balloons"),
  t("Autumn Leaves", "Autumn Leaves", "Autumn Leaves"),
  t("Blossom Pool", "Pool Water", "Cherry Blossoms"),
  t("Magic Spell", "Northern Fire", "Spell Runes"),
  t("Stardust", "Starfield", "Magic Dust"),
  t("Cosmic Ether", "Rainbow Rays", "Jack-o-Lantern Sparks"),
  t("Candy Rain", "Candy", "Confetti"),
  t("Will-o-Wisp", "Smoke", "Fireflies"),
  t("Neon Stars", "Neon City", "Comets"),
  t("Geometry Pool", "Ocean Depths", "Geometric Shapes"),
  t("Sunset Sparkle", "Sunset Drift", "Magic Dust"),
  t("Liquid Stars", "Liquid Metal", "Stars & Sparkles"),
  t("Northern Lights", "Aurora Borealis", "Music Notes"),
  t("Molten Lava", "Lava Lamp", "Fireflies"),
  t("Dream Seeds", "Dreamy Blobs", "Dandelion Seeds"),
  t("Broken World", "Smoke", "Crystal Shards"),
  t("Christmas Snow", "Christmas", "Snowflakes"),
  t("First Dance", "Bokeh", "Rose Petals"),
  t("Headbanger", "Stage Lights", "Skulls"),
  t("Session", "Tie Dye", "Hemp Leaves"),
  t("Zen Garden", "Koi Pond", "Koi Fish"),
  t("Deep Sea", "Deep Ocean", "Jellyfish"),
  t("Blast Off", "Starfield", "Rockets"),
  t("Fairy Garden", "Unicorn Sky", "Fairies"),
  t("Stormy Night", "Rain on Glass", "Umbrellas"),
  t("Spacewalk", "Nebula", "Astronauts"),
];

/** How many combinations the engine can actually produce. */
export const THEME_COUNT = 29;
export const EFFECT_COUNT = 30;

export function findTheme(id: string) {
  return THEMES.find((x) => x.id === id) ?? null;
}

/**
 * Stand-in tint per theme until the engine is embedded — derived from the name
 * so a theme looks the same everywhere it appears.
 */
export function themeTint(theme: Theme) {
  let hash = 0;
  for (let i = 0; i < theme.label.length; i++) {
    hash = (hash * 31 + theme.label.charCodeAt(i)) % 360;
  }
  return `linear-gradient(150deg, hsl(${hash} 55% 46%), hsl(${(hash + 48) % 360} 62% 24%))`;
}
