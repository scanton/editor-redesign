"use client";

import { AgentDock } from "@/components/agent/agent-dock";
import { CanvasArea } from "@/components/canvas/canvas-area";
import { TopBar } from "@/components/chrome/top-bar";
import { Flyout } from "@/components/rail/flyout";
import { LeftRail } from "@/components/rail/left-rail";

export function EditorShell() {
  return (
    // Top bar spans the whole screen so the logo keeps the top-left corner.
    // Rail and panels on the left, canvas in the middle, agent on the right —
    // the assistant sits beside the card rather than in front of the tools.
    <div className="flex h-full flex-col bg-surface">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <LeftRail />
        <Flyout />
        <CanvasArea />
        <AgentDock />
      </div>
    </div>
  );
}
