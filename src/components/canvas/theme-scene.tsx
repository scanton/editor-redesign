"use client";

import { useEffect, useRef } from "react";
import { findEffect, findVariation } from "@/lib/themes-registry";
import { themeTint } from "@/lib/themes";

/**
 * The backgrounds are WebGL. Where there is none — some headless and remote
 * sessions, GPU blocklists — the engine paints itself near-black, which reads
 * as broken. Detect it once and fall back to the theme's tint instead.
 */
let webglOk: boolean | null = null;
function supportsWebGL() {
  if (webglOk !== null) return webglOk;
  try {
    const probe = document.createElement("canvas");
    webglOk = Boolean(
      probe.getContext("webgl") || probe.getContext("experimental-webgl"),
    );
  } catch {
    webglOk = false;
  }
  return webglOk;
}

type Engine = {
  variation?: { stop?: () => void; teardown?: () => void };
  compositing?: { teardown?: () => void };
  sprites?: { teardown?: () => void; stop?: () => void };
};

/**
 * Runs one scene from the vendored html5-themes engine: a WebGL background with
 * a Canvas 2D sprite layer over it. Modules are fetched on demand and torn down
 * on every change, because each variation owns a GL context.
 */
export function ThemeScene({
  themeId,
  effectId,
  speed = 60,
  density = 60,
}: {
  themeId: string;
  effectId: string | null;
  /** 0–100. Drives both the background and the sprite layer. */
  speed?: number;
  density?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine>({});

  // Rebuilding on speed changes would restart the animation, so the mount
  // effect reads the latest values through a ref rather than depending on them.
  const settings = useRef({ speed, density });
  useEffect(() => {
    settings.current = { speed, density };
  }, [speed, density]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    const teardown = () => {
      const e = engineRef.current;
      e.sprites?.stop?.();
      e.sprites?.teardown?.();
      e.variation?.stop?.();
      e.variation?.teardown?.();
      e.compositing?.teardown?.();
      engineRef.current = {};
      host.innerHTML = "";
    };

    (async () => {
      const gl = supportsWebGL();
      const [variationMod, compositingMod, spriteEngineMod] = await Promise.all([
        gl ? findVariation(themeId).load() : Promise.resolve(null),
        import("@/lib/themes-engine/compositing.js"),
        import("@/lib/themes-engine/sprite-engine.js"),
      ]);
      if (cancelled) return;

      teardown();

      const variation = variationMod?.default;
      variation?.setup(host);
      variation?.setSpeed?.(settings.current.speed / 100);

      const compositing = new (
        compositingMod as unknown as { CompositingLayer: new (el: HTMLElement) => object }
      ).CompositingLayer(host);

      const sprites = new (
        spriteEngineMod as unknown as {
          SpriteLayer: new (el: HTMLElement) => {
            setSpeed: (n: number) => void;
            setDensity: (n: number) => void;
            setSprite: (s: unknown) => void;
            start: () => void;
            stop: () => void;
            teardown: () => void;
          };
        }
      ).SpriteLayer(host);

      sprites.setSpeed(settings.current.speed / 100);
      sprites.setDensity(settings.current.density / 100);

      const effect = effectId ? findEffect(effectId) : null;
      if (effect) {
        const mod = await effect.load();
        if (cancelled) return;
        // Sprite modules export their functions directly, not as a default.
        sprites.setSprite(mod.default ?? mod);
        sprites.start();
      }

      variation?.start();
      engineRef.current = { variation: variation ?? undefined, compositing, sprites };
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [themeId, effectId]);

  // Speed and density retune the running scene rather than restarting it.
  useEffect(() => {
    const e = engineRef.current as {
      variation?: { setSpeed?: (n: number) => void };
      sprites?: { setSpeed: (n: number) => void; setDensity: (n: number) => void };
    };
    e.variation?.setSpeed?.(speed / 100);
    e.sprites?.setSpeed(speed / 100);
    e.sprites?.setDensity(density / 100);
  }, [speed, density]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 overflow-hidden"
      // The backgrounds are WebGL. Where there is no GL context the engine
      // paints itself near-black, so the theme's tint sits underneath as a
      // legible fallback rather than a black rectangle.
      style={{ backgroundImage: themeTint(themeId) }}
    />
  );
}
