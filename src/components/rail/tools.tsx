import {
  Languages,
  Mail,
  PenLine,
  Receipt,
  ScrollText,
  Shapes,
  Sparkles,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ToolId } from "@/lib/types";

export type ToolDef = {
  id: ToolId;
  label: string;
  icon: LucideIcon;
  /** Copy for the flyout header — one line, sets expectation for the panel. */
  blurb: string;
};

/**
 * The left rail is the focus of the redesign. Keeping the definition in one
 * place so we can add / merge / reorder tools without touching layout code.
 */
export const TOOLS: ToolDef[] = [
  {
    id: "styles",
    label: "Styles",
    icon: Shapes,
    blurb: "Swap the look of this card — art direction, palette, and vibe.",
  },
  {
    id: "message",
    label: "Message",
    icon: Type,
    blurb: "Write what goes inside. Tone, length, and layout.",
  },
  {
    id: "signature",
    label: "Signature",
    icon: PenLine,
    blurb: "Sign off in your handwriting, or pick a style.",
  },
  {
    id: "translations",
    label: "Translations",
    icon: Languages,
    blurb: "Send this card in another language.",
  },
  {
    id: "longform",
    label: "Long-Form",
    icon: ScrollText,
    blurb: "A newsletter, a poem, a letter — and where it goes.",
  },
  {
    id: "cardtype",
    label: "Card type",
    icon: Sparkles,
    blurb: "Digital or printed — both stay saved.",
  },
  {
    id: "envelope",
    label: "Envelope",
    icon: Mail,
    blurb: "Envelope color, liner, and the addresses on it.",
  },
  {
    id: "review",
    label: "Review",
    icon: Receipt,
    blurb: "Everything you have decided, before it ships.",
  },
];

export function toolsForStep(ids: ToolId[]) {
  return ids
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is ToolDef => Boolean(t));
}
