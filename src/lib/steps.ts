import type { CardType, Product, Step, ToolId } from "./types";

/**
 * The job has three parts: make the card, dress how it is sent, then send it.
 * The rail shows only the part you are in, which is what keeps six-plus panels
 * from reading as one undifferentiated list.
 */
export const STEPS: { id: Step; label: string; note: string }[] = [
  { id: 1, label: "Create", note: "Everything on the card itself" },
  { id: 2, label: "Personalize", note: "How it arrives and how it opens" },
  { id: 3, label: "Finish", note: "Where it goes and what it costs" },
];

/**
 * Panels available in each step, forked twice over.
 *
 * The product decides what Create holds: a greeting card is written and signed,
 * while an invitation carries event data instead — there is no inside to sign,
 * and its words come from the details rather than a message.
 *
 * The rendition then forks Personalize: a print only needs the mailer, while a
 * digital one has a scene, a reveal and a cover.
 */
export function stepTools(
  step: Step,
  cardType: CardType,
  product: Product = "card",
): ToolId[] {
  if (step === 1)
    return product === "invitation"
      ? ["styles", "event", "translations"]
      : ["styles", "message", "longform", "signature", "translations"];
  if (step === 2)
    return cardType === "digital"
      ? ["cardtype", "background", "envelope", "reveal", "cover"]
      : ["cardtype", "envelope"];
  return cardType === "digital"
    ? ["delivery", "recipients", "review"]
    : ["delivery", "recipients", "printopts", "review"];
}

const DIGITAL_ONLY: ToolId[] = ["background", "reveal", "cover"];

const FINISH_TOOLS: ToolId[] = ["delivery", "recipients", "printopts", "review"];

/**
 * The panel a step opens on. Landing on a step with nothing open reads as a
 * dead end, so each one leads with its first decision — except Create, where
 * the card itself is the thing to look at.
 */
export const STEP_DEFAULT_TOOL: Record<Step, ToolId | null> = {
  1: null,
  2: "cardtype",
  3: "delivery",
};

export function stepOf(tool: ToolId): Step {
  if (FINISH_TOOLS.includes(tool)) return 3;
  if (tool === "cardtype" || tool === "envelope" || DIGITAL_ONLY.includes(tool))
    return 2;
  return 1;
}

/** Panels that only exist on the digital rendition. */
export function isDigitalOnly(tool: ToolId) {
  return DIGITAL_ONLY.includes(tool);
}

/* --------------------------------------------------------------- the flow */

/**
 * Create is a palette: open what you like, skip what you don't, in any order.
 * Personalize and Finish are a form — every section is a decision that ends up
 * on the order, so they are walked front to back.
 *
 * That difference is deliberate and visible: only these two steps number their
 * rail and carry Back / Next.
 */
export function isGuided(step: Step) {
  return step !== 1;
}

export type FlowStop = { step: Step; tool: ToolId };

/**
 * Every section of the guided part, in order, across both steps — so the last
 * panel of Personalize leads into Finish rather than dead-ending.
 */
export function guidedFlow(cardType: CardType, product: Product): FlowStop[] {
  return [
    ...stepTools(2, cardType, product).map((tool) => ({ step: 2 as Step, tool })),
    ...stepTools(3, cardType, product).map((tool) => ({ step: 3 as Step, tool })),
  ];
}

/** Where a section sits in the flow, and what is either side of it. */
export function flowPosition(
  tool: ToolId,
  cardType: CardType,
  product: Product,
) {
  const flow = guidedFlow(cardType, product);
  const index = flow.findIndex((s) => s.tool === tool);
  if (index < 0) return null;
  return {
    index,
    total: flow.length,
    prev: index > 0 ? flow[index - 1] : null,
    next: index < flow.length - 1 ? flow[index + 1] : null,
  };
}
