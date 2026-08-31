import type { Step, ToolId } from "./types";

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

/** Panels available in each step. Card type forks the Personalize rail. */
export const STEP_TOOLS: Record<Step, ToolId[]> = {
  1: ["styles", "message", "longform", "signature", "translations"],
  2: ["cardtype", "envelope"],
  3: ["review"],
};

export function stepOf(tool: ToolId): Step {
  for (const step of [1, 2, 3] as Step[]) {
    if (STEP_TOOLS[step].includes(tool)) return step;
  }
  return 1;
}
