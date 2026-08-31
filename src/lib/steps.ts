import type { CardType, Step, ToolId } from "./types";

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
 * Panels available in each step. Card type forks the Personalize rail: a print
 * only needs the mailer, while a digital card has a scene, a reveal and a cover.
 */
export function stepTools(step: Step, cardType: CardType): ToolId[] {
  if (step === 1)
    return ["styles", "message", "longform", "signature", "translations"];
  if (step === 2)
    return cardType === "digital"
      ? ["cardtype", "background", "envelope", "reveal", "cover"]
      : ["cardtype", "envelope"];
  return ["review"];
}

const DIGITAL_ONLY: ToolId[] = ["background", "reveal", "cover"];

export function stepOf(tool: ToolId): Step {
  if (tool === "review") return 3;
  if (tool === "cardtype" || tool === "envelope" || DIGITAL_ONLY.includes(tool))
    return 2;
  return 1;
}

/** Panels that only exist on the digital rendition. */
export function isDigitalOnly(tool: ToolId) {
  return DIGITAL_ONLY.includes(tool);
}
