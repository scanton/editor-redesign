/**
 * Registry for the vendored html5-themes engine. Every scene is a lazy import,
 * so opening the editor does not download 32 WebGL backgrounds and 30 sprite
 * effects — only the one on screen.
 */

/** A background variation module. */
export type VariationModule = {
  default: {
    name: string;
    setup: (el: HTMLElement) => void;
    start: () => void;
    stop: () => void;
    reset?: () => void;
    teardown?: () => void;
    setSpeed?: (s: number) => void;
  };
};

/** A sprite effect module. */
export type SpriteModule = {
  name: string;
  init: (w: number, h: number, density?: number) => unknown;
  update: (state: unknown, dt: number, elapsed: number) => void;
  draw: (ctx: CanvasRenderingContext2D, state: unknown) => void;
};

export type Entry<T> = { id: string; label: string; load: () => Promise<T> };

export const VARIATIONS: Entry<VariationModule>[] = [
  { id: "dreamy-blobs", label: "Dreamy Blobs", load: () => import("./themes-engine/variations/01-dreamy-blobs.js") },
  { id: "lava-lamp", label: "Lava Lamp", load: () => import("./themes-engine/variations/02-lava-lamp.js") },
  { id: "aurora", label: "Aurora Borealis", load: () => import("./themes-engine/variations/03-aurora.js") },
  { id: "liquid-metal", label: "Liquid Metal", load: () => import("./themes-engine/variations/04-liquid-metal.js") },
  { id: "sunset-drift", label: "Sunset Drift", load: () => import("./themes-engine/variations/05-sunset-drift.js") },
  { id: "ocean-depths", label: "Ocean Depths", load: () => import("./themes-engine/variations/06-ocean-depths.js") },
  { id: "neon-city", label: "Neon City", load: () => import("./themes-engine/variations/07-neon-city.js") },
  { id: "smoke", label: "Smoke", load: () => import("./themes-engine/variations/08-smoke.js") },
  { id: "candy", label: "Candy", load: () => import("./themes-engine/variations/09-candy.js") },
  { id: "northern-fire", label: "Northern Fire", load: () => import("./themes-engine/variations/10-northern-fire.js") },
  { id: "pool-water", label: "Pool Water", load: () => import("./themes-engine/variations/11-pool-water.js") },
  { id: "snowfall", label: "Snowfall", load: () => import("./themes-engine/variations/12-snowfall.js") },
  { id: "beer", label: "Beer", load: () => import("./themes-engine/variations/13-beer.js") },
  { id: "tie-dye", label: "Tie Dye", load: () => import("./themes-engine/variations/14-tie-dye.js") },
  { id: "hearts", label: "Hearts", load: () => import("./themes-engine/variations/15-hearts.js") },
  { id: "halloween", label: "Halloween", load: () => import("./themes-engine/variations/16-halloween.js") },
  { id: "christmas", label: "Christmas", load: () => import("./themes-engine/variations/17-christmas.js") },
  { id: "fireworks", label: "Fireworks", load: () => import("./themes-engine/variations/18-fireworks.js") },
  { id: "cherry-blossoms", label: "Cherry Blossoms", load: () => import("./themes-engine/variations/19-cherry-blossoms.js") },
  { id: "confetti", label: "Confetti", load: () => import("./themes-engine/variations/20-confetti.js") },
  { id: "underwater", label: "Underwater", load: () => import("./themes-engine/variations/21-underwater.js") },
  { id: "autumn-leaves", label: "Autumn Leaves", load: () => import("./themes-engine/variations/22-autumn-leaves.js") },
  { id: "starfield", label: "Starfield", load: () => import("./themes-engine/variations/23-starfield.js") },
  { id: "candlelight", label: "Candlelight", load: () => import("./themes-engine/variations/24-candlelight.js") },
  { id: "rainbow-rays", label: "Rainbow Rays", load: () => import("./themes-engine/variations/25-rainbow-rays.js") },
  { id: "bokeh", label: "Bokeh", load: () => import("./themes-engine/variations/26-bokeh.js") },
  { id: "stage-lights", label: "Stage Lights", load: () => import("./themes-engine/variations/27-stage-lights.js") },
  { id: "koi-pond", label: "Koi Pond", load: () => import("./themes-engine/variations/28-koi-pond.js") },
  { id: "deep-ocean", label: "Deep Ocean", load: () => import("./themes-engine/variations/29-deep-ocean.js") },
  { id: "unicorn-sky", label: "Unicorn Sky", load: () => import("./themes-engine/variations/30-unicorn-sky.js") },
  { id: "rain-on-glass", label: "Rain on Glass", load: () => import("./themes-engine/variations/31-rain-on-glass.js") },
  { id: "nebula", label: "Nebula", load: () => import("./themes-engine/variations/32-nebula.js") },
];

/** "None" is a real choice — a background with no effect over it. */
export const EFFECTS: Entry<{ default?: SpriteModule } & SpriteModule>[] = [
  { id: "bubbles", label: "Bubbles", load: () => import("./themes-engine/sprites/01-bubbles.js") },
  { id: "hearts", label: "Hearts", load: () => import("./themes-engine/sprites/02-hearts.js") },
  { id: "snowflakes", label: "Snowflakes", load: () => import("./themes-engine/sprites/03-snowflakes.js") },
  { id: "stars", label: "Stars & Sparkles", load: () => import("./themes-engine/sprites/04-stars.js") },
  { id: "balloons", label: "Balloons", load: () => import("./themes-engine/sprites/05-balloons.js") },
  { id: "confetti", label: "Confetti", load: () => import("./themes-engine/sprites/06-confetti.js") },
  { id: "ribbons", label: "Gift Ribbons", load: () => import("./themes-engine/sprites/07-ribbons.js") },
  { id: "magic-dust", label: "Magic Dust", load: () => import("./themes-engine/sprites/08-magic-dust.js") },
  { id: "fireflies", label: "Fireflies", load: () => import("./themes-engine/sprites/09-fireflies.js") },
  { id: "butterflies", label: "Butterflies", load: () => import("./themes-engine/sprites/10-butterflies.js") },
  { id: "cherry-blossoms", label: "Cherry Blossoms", load: () => import("./themes-engine/sprites/11-cherry-blossoms.js") },
  { id: "dandelion-seeds", label: "Dandelion Seeds", load: () => import("./themes-engine/sprites/12-dandelion-seeds.js") },
  { id: "crystal-shards", label: "Crystal Shards", load: () => import("./themes-engine/sprites/13-crystal-shards.js") },
  { id: "spell-runes", label: "Spell Runes", load: () => import("./themes-engine/sprites/14-spell-runes.js") },
  { id: "jack-sparks", label: "Jack-o-Lantern Sparks", load: () => import("./themes-engine/sprites/15-jack-sparks.js") },
  { id: "comets", label: "Comets", load: () => import("./themes-engine/sprites/16-comets.js") },
  { id: "geometric", label: "Geometric Shapes", load: () => import("./themes-engine/sprites/17-geometric.js") },
  { id: "music-notes", label: "Music Notes", load: () => import("./themes-engine/sprites/18-music-notes.js") },
  { id: "paper-planes", label: "Paper Planes", load: () => import("./themes-engine/sprites/19-paper-planes.js") },
  { id: "moon-phases", label: "Moon Phases", load: () => import("./themes-engine/sprites/20-moon-phases.js") },
  { id: "autumn-leaves", label: "Autumn Leaves", load: () => import("./themes-engine/sprites/21-autumn-leaves.js") },
  { id: "rose-petals", label: "Rose Petals", load: () => import("./themes-engine/sprites/22-rose-petals.js") },
  { id: "skulls", label: "Skulls", load: () => import("./themes-engine/sprites/23-skulls.js") },
  { id: "hemp-leaves", label: "Hemp Leaves", load: () => import("./themes-engine/sprites/24-hemp-leaves.js") },
  { id: "koi-fish", label: "Koi Fish", load: () => import("./themes-engine/sprites/25-koi-fish.js") },
  { id: "jellyfish", label: "Jellyfish", load: () => import("./themes-engine/sprites/26-jellyfish.js") },
  { id: "rockets", label: "Rockets", load: () => import("./themes-engine/sprites/27-rockets.js") },
  { id: "fairies", label: "Fairies", load: () => import("./themes-engine/sprites/28-fairies.js") },
  { id: "umbrellas", label: "Umbrellas", load: () => import("./themes-engine/sprites/29-umbrellas.js") },
  { id: "astronauts", label: "Astronauts", load: () => import("./themes-engine/sprites/30-astronauts.js") },
];

export function findVariation(id: string) {
  return VARIATIONS.find((v) => v.id === id) ?? VARIATIONS[0];
}

export function findEffect(id: string) {
  return EFFECTS.find((e) => e.id === id) ?? null;
}
