/**
 * Fonts a customer can put on a card. `cssVar` lets panel UI preview the face
 * in-place; Konva resolves the same key through `useFontFamilies`.
 */
export type CardFont = {
  id: string;
  label: string;
  cssVar: string;
};

export const CARD_FONTS: CardFont[] = [
  { id: "Caveat", label: "Caveat", cssVar: "var(--font-caveat)" },
  { id: "Arima", label: "Arima Variable Font", cssVar: "var(--font-arima)" },
  { id: "Fredoka", label: "Fredoka", cssVar: "var(--font-fredoka)" },
  { id: "DM Sans", label: "DM Sans", cssVar: "var(--font-dm-sans)" },
];

export function fontCssVar(id: string) {
  return CARD_FONTS.find((f) => f.id === id)?.cssVar ?? "inherit";
}

/** The palette the current card art suggests — mirrors "Recommended colors". */
export const RECOMMENDED_COLORS = [
  "#1f3fd8",
  "#0d0d12",
  "#ffd23f",
  "#12239e",
  "#e2573b",
  "#f3e3c8",
  "#4a2f18",
  "#a0673a",
  "#c08b52",
  "#e0bd76",
  "#16161a",
  "#4b4b55",
  "#a3a3ad",
  "#ffffff",
];
