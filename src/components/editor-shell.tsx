"use client";

import { AgentDock } from "@/components/agent/agent-dock";
import { CanvasArea } from "@/components/canvas/canvas-area";
import { TopBar } from "@/components/chrome/top-bar";
import { Flyout } from "@/components/rail/flyout";
import { LeftRail } from "@/components/rail/left-rail";

export function EditorShell() {
  return (
    // The top bar spans the whole screen so the logo keeps the top-left corner;
    // everything else, agent included, sits in the row beneath it.
    <div className="flex h-full flex-col bg-surface">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <AgentDock />
        <LeftRail />
        <Flyout />
        <CanvasArea />
      </div>
    </div>
  );
}
