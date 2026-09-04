"use client";

import { useEditorStore } from "@/store/editor-store";
import type { DrawNode, TextNode, ToolId } from "./types";
import { missingRequired } from "./invitation";
import { stepOf } from "./steps";

export type Warning = {
  id: string;
  label: string;
  note: string;
  tool: ToolId;
  go: () => void;
};

/**
 * Work the customer has not done yet. Each one is a link rather than a scold —
 * it jumps to the step and opens the panel that fixes it.
 */
export function useWarnings(): Warning[] {
  const product = useEditorStore((s) => s.product);
  const invitation = useEditorStore((s) => s.invitation);
  const doc = useEditorStore((s) => s.doc);
  const envelope = useEditorStore((s) => s.envelope);
  const setStep = useEditorStore((s) => s.setStep);
  const setTool = useEditorStore((s) => s.setTool);
  const cardTypeIsPrinted = useEditorStore((s) => s.cardType === "printed");

  const nodes = Object.values(doc.faces).flatMap((f) => f.nodes);
  const message = nodes.find((n) => n.id === "inside_message") as
    | TextNode
    | undefined;
  const signature = nodes.find((n) => n.id === "inside_signature") as
    | DrawNode
    | undefined;

  const open = (tool: ToolId) => () => {
    setStep(stepOf(tool));
    setTool(tool);
  };

  const list: Warning[] = [];

  // An invitation is not written or signed — what it can be short of is the
  // event data the renderer requires, and a render that has fallen behind it.
  if (product === "invitation") {
    const gaps = missingRequired(invitation);
    if (gaps.length) {
      list.push({
        id: "event-gaps",
        label: gaps.length === 1 ? `${gaps[0]} missing` : "Event details missing",
        note: `The renderer needs ${listOf(gaps)}.`,
        tool: "event",
        go: open("event"),
      });
    }
    if (invitation.stale && !invitation.rendering) {
      list.push({
        id: "stale-render",
        label: "Artwork is out of date",
        note: "Details changed since the invitation was last rendered.",
        tool: "event",
        go: open("event"),
      });
    }
    if (invitation.rsvpOn && !invitation.qrOn && cardTypeIsPrinted) {
      list.push({
        id: "no-qr",
        label: "No way to RSVP in print",
        note: "A printed invitation has no link to tap — guests need the code.",
        tool: "event",
        go: open("event"),
      });
    }
    if (!envelope.recipient.name.trim()) {
      list.push({
        id: "no-address",
        label: "Envelope not addressed",
        note: "No recipient on the envelope yet.",
        tool: "envelope",
        go: open("envelope"),
      });
    }
    return list;
  }

  if (!signature || (signature.strokes.length === 0 && !signature.typed?.text)) {
    list.push({
      id: "unsigned",
      label: "Signature missing",
      note: "Nothing signed yet, so the card goes out unsigned.",
      tool: "signature",
      go: open("signature"),
    });
  }

  if (!message?.text.trim()) {
    list.push({
      id: "no-message",
      label: "Message is empty",
      note: "The inside has no words on it.",
      tool: "message",
      go: open("message"),
    });
  }

  if (!envelope.recipient.name.trim()) {
    list.push({
      id: "no-address",
      label: "Envelope not addressed",
      note: "No recipient on the envelope yet.",
      tool: "envelope",
      go: open("envelope"),
    });
  }

  return list;
}

function listOf(items: string[]) {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
