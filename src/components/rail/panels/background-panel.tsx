"use client";

import { motion } from "motion/react";
import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { GradientBackground } from "@/components/canvas/gradient-background";
import { PanelBody, Section, inputClass } from "@/components/rail/panels/parts";
import { springBouncy, springTight, staggerParent } from "@/lib/motion";
import {
  ASSET_SCENES,
  BACKGROUND_TABS,
  SCENE_COUNTS,
  TOTAL_BACKGROUNDS,
  type Scene,
} from "@/lib/digital-card";
import { GRADIENT_STYLES } from "@/lib/gradient-styles";
import { PALETTES } from "@/lib/gradient-palettes";
import { THEMES, themeTint } from "@/lib/themes";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

/**
 * The scene behind the card. Four kinds, and two of them are generated rather
 * than picked from a list: a gradient is a style crossed with a palette, and a
 * theme is a background crossed with an effect. Those get their own controls
 * instead of pretending to be a flat grid of hundreds of thumbnails.
 */
export function BackgroundPanel() {
  const scene = useEditorStore((s) => s.digital.scene);
  const tab = useEditorStore((s) => s.digital.backgroundTab);
  const setDigital = useEditorStore((s) => s.setDigital);
  const [query, setQuery] = useState("");

  const setScene = (next: Scene) => setDigital({ scene: next });

  const q = query.trim().toLowerCase();
  const show = (kind: string) =>
    !q && (tab === "All" || tab === kind);

  const searchHits = useMemo(() => {
    if (!q) return null;
    return {
      styles: GRADIENT_STYLES.filter((s) => s.name.toLowerCase().includes(q)),
      palettes: PALETTES.filter((p) => p.name.toLowerCase().includes(q)),
      themes: THEMES.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.theme.toLowerCase().includes(q) ||
          t.effect.toLowerCase().includes(q),
      ),
      assets: ASSET_SCENES.filter((a) => a.label.toLowerCase().includes(q)),
    };
  }, [q]);

  const gradientStyle =
    scene.kind === "Gradient" ? scene.styleId : GRADIENT_STYLES[0].id;
  const gradientPalette =
    scene.kind === "Gradient" ? scene.paletteId : PALETTES[0].id;

  return (
    <PanelBody>
      <motion.div variants={staggerParent} initial="hidden" animate="visible">
        <Section>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${TOTAL_BACKGROUNDS.toLocaleString()} backgrounds`}
              className={cn(inputClass, "pl-10")}
            />
          </div>
        </Section>

        {!q && (
          <Section>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_TABS.map((t) => (
                <motion.button
                  key={t}
                  type="button"
                  onClick={() => setDigital({ backgroundTab: t })}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springTight}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    tab === t
                      ? "border-transparent bg-ink text-white"
                      : "border-hairline text-ink-soft hover:text-ink",
                  )}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </Section>
        )}

        {/* ── Gradients: a style crossed with a palette ────────────────── */}
        {(show("Gradient") || searchHits?.styles.length) && (
          <Section
            title="Gradient · style"
            action={<Count n={GRADIENT_STYLES.length} />}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {(searchHits?.styles ?? GRADIENT_STYLES).map((style) => {
                const on =
                  scene.kind === "Gradient" && scene.styleId === style.id;
                return (
                  <Tile
                    key={style.id}
                    label={style.name}
                    on={on}
                    title={style.description}
                    onPick={() =>
                      setScene({
                        kind: "Gradient",
                        styleId: style.id,
                        paletteId: gradientPalette,
                      })
                    }
                  >
                    {/* Real thing, not a stand-in — the same renderer the card sits on. */}
                    <GradientBackground
                      styleId={style.id}
                      palette={
                        PALETTES.find((p) => p.id === gradientPalette) ??
                        PALETTES[0]
                      }
                      maxDimension={140}
                      speed={8}
                    />
                  </Tile>
                );
              })}
            </div>
          </Section>
        )}

        {(show("Gradient") || searchHits?.palettes.length) && (
          <Section
            title="Gradient · palette"
            action={<Count n={PALETTES.length} />}
          >
            <div className="grid grid-cols-4 gap-2">
              {(searchHits?.palettes ?? PALETTES).map((palette) => {
                const on =
                  scene.kind === "Gradient" && scene.paletteId === palette.id;
                return (
                  <motion.button
                    key={palette.id}
                    type="button"
                    title={palette.name}
                    onClick={() =>
                      setScene({
                        kind: "Gradient",
                        styleId: gradientStyle,
                        paletteId: palette.id,
                      })
                    }
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springTight}
                    className="text-left"
                  >
                    <span
                      className={cn(
                        "flex h-7 overflow-hidden rounded-[7px] ring-2",
                        on
                          ? "ring-ink"
                          : "ring-transparent hover:ring-hairline-strong",
                      )}
                    >
                      {palette.colors.map((c) => (
                        <span
                          key={c}
                          className="flex-1"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block truncate text-[10.5px] leading-tight",
                        on ? "font-semibold text-ink" : "text-ink-faint",
                      )}
                    >
                      {palette.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Themes: a background crossed with an effect ──────────────── */}
        {(show("3D Animation") || searchHits?.themes.length) && (
          <Section
            title="3D Animation · theme × effect"
            action={<Count n={SCENE_COUNTS.themes} />}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {(searchHits?.themes ?? THEMES).map((theme) => {
                const on =
                  scene.kind === "3D Animation" && scene.themeId === theme.id;
                return (
                  <Tile
                    key={theme.id}
                    label={theme.label}
                    sub={`${theme.theme} + ${theme.effect}`}
                    on={on}
                    wide
                    onPick={() =>
                      setScene({ kind: "3D Animation", themeId: theme.id })
                    }
                  >
                    <span
                      className="absolute inset-0"
                      style={{ backgroundImage: themeTint(theme) }}
                    />
                  </Tile>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Flat assets ──────────────────────────────────────────────── */}
        {["Video BG", "Stills"].map((kind) => {
          const items = (searchHits?.assets ?? ASSET_SCENES).filter(
            (a) => a.kind === kind,
          );
          if (!items.length || (!q && !show(kind))) return null;
          return (
            <Section
              key={kind}
              title={kind === "Video BG" ? "Video BG · cinematic" : "Stills"}
              action={
                <Count
                  n={kind === "Video BG" ? SCENE_COUNTS.video : SCENE_COUNTS.stills}
                />
              }
            >
              <div className="grid grid-cols-2 gap-2.5">
                {items.map((asset) => {
                  const on =
                    (scene.kind === "Video BG" || scene.kind === "Stills") &&
                    scene.id === asset.id;
                  return (
                    <Tile
                      key={asset.id}
                      label={asset.label}
                      on={on}
                      wide
                      onPick={() =>
                        setScene({
                          kind: asset.kind,
                          id: asset.id,
                        })
                      }
                    >
                      <span
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `linear-gradient(145deg, ${asset.gradient})`,
                        }}
                      />
                    </Tile>
                  );
                })}
              </div>
            </Section>
          );
        })}

        <Section>
          <p className="rounded-[12px] bg-surface-sunken/70 p-3 text-[12px] leading-snug text-ink-faint">
            Scene changes are instant. The scene sits behind the card rather than
            in it, so your artwork is never touched and there is nothing to wait
            for.
          </p>
        </Section>
      </motion.div>
    </PanelBody>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="text-[11.5px] tabular-nums text-ink-faint">
      {n.toLocaleString()}
    </span>
  );
}

function Tile({
  label,
  sub,
  on,
  wide,
  title,
  onPick,
  children,
}: {
  label: string;
  sub?: string;
  on: boolean;
  wide?: boolean;
  title?: string;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      title={title}
      onClick={onPick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={springTight}
      className="text-left"
    >
      <span
        className={cn(
          "relative flex items-end overflow-hidden rounded-[9px] p-1.5 ring-2 transition-shadow",
          wide ? "aspect-[16/10]" : "aspect-square",
          on ? "shadow-rail ring-ink" : "ring-transparent hover:ring-hairline-strong",
        )}
      >
        {children}
        <span className="relative z-10 text-[10.5px] font-semibold leading-tight text-white drop-shadow">
          {label}
        </span>
        {on && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springBouncy}
            className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-white"
          >
            <Check size={10} strokeWidth={3} />
          </motion.span>
        )}
      </span>
      {sub && (
        <span className="mt-1 block truncate text-[10.5px] text-ink-faint">
          {sub}
        </span>
      )}
    </motion.button>
  );
}
