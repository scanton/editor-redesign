import type { CardType, Product } from "./types";

export type Rendition = {
  id: CardType;
  label: string;
  price: string;
  unit: number;
  note: string;
};

/**
 * What each rendition costs, per product line. Invitations are cheaper per
 * piece and bought by the dozen; greeting cards are usually bought one at a
 * time, which is why only invitations carry quantity breaks.
 */
const PRICING: Record<Product, Rendition[]> = {
  card: [
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
  ],
  invitation: [
    {
      id: "digital",
      label: "Digital 3D invitation",
      price: "$1.49 each",
      unit: 1.49,
      note: "An animated reveal guests open from a link, with the RSVP page attached. Billed per invitation sent.",
    },
    {
      id: "printed",
      label: "Printed invitation",
      price: "$3.49 each",
      unit: 3.49,
      note: "A7 on heavyweight matte, shipped to you ready to send. Envelopes are an add-on.",
    },
  ],
};

/**
 * Quantity breaks, printed invitations only. Ordering invitations one at a
 * time is not the usual case — a guest list is.
 */
export const QUANTITY_BREAKS: { from: number; discount: number }[] = [
  { from: 10, discount: 0.1 },
  { from: 25, discount: 0.15 },
  { from: 50, discount: 0.2 },
];

/** Envelopes come with a greeting card; on invitations they are chosen. */
export const ENVELOPE_ADD_ON = 0.45;

export function renditions(product: Product) {
  return PRICING[product];
}

export function priceOf(type: CardType, product: Product = "card") {
  return PRICING[product].find((t) => t.id === type)!;
}

/** The break a quantity earns, or null below the first one. */
export function breakFor(product: Product, quantity: number) {
  if (product !== "invitation") return null;
  return (
    [...QUANTITY_BREAKS].reverse().find((b) => quantity >= b.from) ?? null
  );
}

/** Unit price after any quantity break. */
export function unitPrice(
  product: Product,
  type: CardType,
  quantity: number,
) {
  const base = priceOf(type, product).unit;
  if (type === "digital") return base;
  const tier = breakFor(product, quantity);
  return tier ? base * (1 - tier.discount) : base;
}

/** Kept for the greeting-card panels that predate the second product line. */
export const CARD_TYPES = PRICING.card;
