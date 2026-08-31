import type { CardType } from "./types";

/** How a digital card reaches someone. */
export const DIGITAL_DELIVERY = [
  {
    id: "link",
    label: "Share a link",
    note: "Opens in any browser, no account needed",
  },
  {
    id: "email",
    label: "Send by email",
    note: "We send it, with your name on it",
  },
  {
    id: "video",
    label: "Share a video",
    note: "The whole reveal as a clip — renders after checkout",
  },
] as const;

/** How a printed card reaches someone. */
export const PRINTED_DELIVERY = [
  {
    id: "mail",
    label: "Direct mail",
    note: "We address it, stamp it and post it to them.",
  },
  {
    id: "ship",
    label: "Ship it to me",
    note: "It arrives blank-enveloped for you to send on.",
  },
] as const;

export type DigitalDelivery = (typeof DIGITAL_DELIVERY)[number]["id"];
export type PrintedDelivery = (typeof PRINTED_DELIVERY)[number]["id"];

/**
 * Print is one specification, not a set of choices — we run a single stock and
 * square corners. These are facts to state, not options to offer.
 */
export const PRINT_SPEC = {
  stock: "Heavyweight matte · 350gsm",
  corners: "Square",
  region: "United States · First-class postage",
};

export type Recipient = {
  id: string;
  name: string;
  email: string;
  line1: string;
  line2: string;
};

/** The other rendition, pitched at checkout. */
export function upsellFor(cardType: CardType) {
  return cardType === "digital"
    ? {
        badge: "Make it land twice",
        title: "Add the printed card",
        body: "The same artwork on heavyweight matte, printed and posted by us. Stock, corners and the mailer are already set — change them any time before it goes to print.",
        cta: "Add printed · $5.99",
      }
    : {
        badge: "Send it today too",
        title: "Add a digital card",
        body: "A card they can open right now, while the print is in the post. It uses the scene and reveal you have already set — edit either later.",
        cta: "Add digital · $2.99",
      };
}
