"use client";

import { useEditorStore } from "@/store/editor-store";
import type { DrawNode, TextNode, ToolId } from "./types";
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
  const doc = useEditorStore((s) => s.doc);
  const envelope = useEditorStore((s) => s.envelope);
  const setStep = useEditorStore((s) => s.setStep);
  const setTool = useEditorStore((s) => s.setTool);

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
