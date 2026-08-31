import type { CardType } from "./types";

export const CARD_TYPES: {
  id: CardType;
  label: string;
  price: string;
  unit: number;
  note: string;
}[] = [
  {
    id: "digital",
    label: "Digital 3D card",
    price: "$2.99 each",
    unit: 2.99,
    note: "Opens on their screen with a scene, an envelope and a reveal. Sent by link, email or as a video.",
  },
  {
    id: "printed",
    label: "Printed card",
    price: "$5.99 each",
    unit: 5.99,
    note: "Heavyweight matte, printed and posted by us, or shipped to you to send on yourself.",
  },
];

export function priceOf(type: CardType) {
  return CARD_TYPES.find((t) => t.id === type)!;
}
