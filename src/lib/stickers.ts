/**
 * The sticker library. Placeholders for now — each one is a glyph rather than
 * a drawn asset, so the shelf can be browsed, placed and resized before the
 * real artwork exists. Swapping a glyph for an image is one field.
 *
 * A sticker is deliberately its own thing rather than a corner of Message.
 * People know the word, and it is the part of a card you fiddle with after the
 * words are done.
 */
export type Sticker = {
  id: string;
  label: string;
  glyph: string;
};

export type StickerGroup = { label: string; stickers: Sticker[] };

export const STICKER_GROUPS: StickerGroup[] = [
  {
    label: "Celebrate",
    stickers: [
      { id: "confetti", label: "Confetti", glyph: "🎉" },
      { id: "balloon", label: "Balloon", glyph: "🎈" },
      { id: "cake", label: "Cake", glyph: "🎂" },
      { id: "sparkles", label: "Sparkles", glyph: "✨" },
      { id: "champagne", label: "Fizz", glyph: "🍾" },
      { id: "trophy", label: "Trophy", glyph: "🏆" },
    ],
  },
  {
    label: "Milestones",
    stickers: [
      { id: "cap", label: "Mortarboard", glyph: "🎓" },
      { id: "rings", label: "Rings", glyph: "💍" },
      { id: "baby", label: "Baby", glyph: "🍼" },
      { id: "house", label: "New place", glyph: "🏡" },
      { id: "briefcase", label: "New job", glyph: "💼" },
      { id: "plane", label: "Off somewhere", glyph: "✈️" },
    ],
  },
  {
    label: "Feelings",
    stickers: [
      { id: "heart", label: "Heart", glyph: "❤️" },
      { id: "hearts", label: "Smitten", glyph: "😍" },
      { id: "laugh", label: "Crying laughing", glyph: "😂" },
      { id: "hug", label: "Hug", glyph: "🫂" },
      { id: "clap", label: "Applause", glyph: "👏" },
      { id: "fingers", label: "Fingers crossed", glyph: "🤞" },
    ],
  },
  {
    label: "Doodles",
    stickers: [
      { id: "star", label: "Star", glyph: "⭐" },
      { id: "bolt", label: "Bolt", glyph: "⚡" },
      { id: "flower", label: "Flower", glyph: "🌸" },
      { id: "rainbow", label: "Rainbow", glyph: "🌈" },
      { id: "fire", label: "Fire", glyph: "🔥" },
      { id: "skull", label: "Skull", glyph: "💀" },
    ],
  },
];

export const STICKERS = STICKER_GROUPS.flatMap((g) => g.stickers);

export function findSticker(id: string) {
  return STICKERS.find((s) => s.id === id) ?? null;
}

/** Glyphs a described sticker stands in with, until the model renders one. */
const MADE_GLYPHS = ["🪄", "🌟", "🎨", "🦄", "🍄", "🐙", "🪩", "🧁"];

export function glyphForPrompt(prompt: string) {
  // Stable per prompt, so the same description keeps the same stand-in.
  let hash = 0;
  for (const ch of prompt) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return MADE_GLYPHS[hash % MADE_GLYPHS.length];
}

/** How big a new sticker lands, as a fraction of the panel's short side. */
export const STICKER_SIZE = 0.22;
