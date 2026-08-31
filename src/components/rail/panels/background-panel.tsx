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
import {
  THEME_EFFECTS,
  THEME_PRESETS,
  THEME_VARIATIONS,
  describeTheme,
  matchPreset,
  themeTint,
} from "@/lib/themes";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

const DEFAULT_THEME = "tie-dye";
const DEFAULT_EFFECT = "butterflies";

/**
 * The scene behind the card. Two of the four kinds are generated rather than
 * listed — a gradient is a style crossed with a palette, an animated scene is a
 * theme crossed with an effect — so each gets a small set of controls instead of
 * a grid of hundreds of thumbnails.
 *
 * Those controls only appear when their kind is in play, so the panel is short
 * unless you are actually working in it.
 */
export function BackgroundPanel() {
  const scene = useEditorStore((s) => s.digital.scene);
  const tab = useEditorStore((s) => s.digital.backgroundTab);
  const setDigital = useEditorStore((s) => s.setDigital);
  const [query, setQuery] = useState("");

  const setScene = (next: Scene) => setDigital({ scene: next });
  const q = query.trim().toLowerCase();

  /** A kind's controls show when it is the active scene or the chosen tab. */
  const showing = (kind: string) =>
    !q && (tab === kind || (tab === "All" && scene.kind === kind));
  /** Its picker always shows under All, so a kind can be reached. */
  const listed = (kind: string) => !q && (tab === "All" || tab === kind);

  const hits = useMemo(() => {
    if (!q) return null;
    return {
      styles: GRADIENT_STYLES.filter((s) => s.name.toLowerCase().includes(q)),
      presets: THEME_PRESETS.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          describeTheme(p.themeId, p.effectId).toLowerCase().includes(q),
      ),
      assets: ASSET_SCENES.filter((a) => a.label.toLowerCase().includes(q)),
    };
  }, [q]);

  const gradientStyle =
    scene.kind === "Gradient" ? scene.styleId : GRADIENT_STYLES[0].id;
  const gradientPalette =
    scene.kind === "Gradient" ? scene.paletteId : PALETTES[3].id;
  const gradientSpeed = scene.kind === "Gradient" ? scene.speed : 12;

  const themeId = scene.kind === "3D Animation" ? scene.themeId : DEFAULT_THEME;
  const effectId =
    scene.kind === "3D Animation" ? scene.effectId : DEFAULT_EFFECT;
  const themeSpeed = scene.kind === "3D Animation" ? scene.speed : 60;
  const activePreset =
    scene.kind === "3D Animation" ? matchPreset(themeId, effectId) : null;

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

        {/* ── Gradient ─────────────────────────────────────────────────── */}
        {(listed("Gradient") || hits?.styles.length) && (
          <Section title="Gradient · style" action={<Count n={SCENE_COUNTS.gradient} />}>
            <div className="grid grid-cols-3 gap-2.5">
              {(hits?.styles ?? GRADIENT_STYLES).map((style) => (
                <Tile
                  key={style.id}
                  label={style.name}
                  title={style.description}
                  on={scene.kind === "Gradient" && scene.styleId === style.id}
                  onPick={() =>
                    setScene({
                      kind: "Gradient",
                      styleId: style.id,
                      paletteId: gradientPalette,
                      speed: gradientSpeed,
                    })
                  }
                >
                  <GradientBackground
                    styleId={style.id}
                    palette={
                      PALETTES.find((p) => p.id === gradientPalette) ?? PALETTES[0]
                    }
                    maxDimension={140}
                    speed={Math.min(gradientSpeed, 20)}
                  />
                </Tile>
              ))}
            </div>
          </Section>
        )}

        {showing("Gradient") && (
          <>
            <Section title="Palette" action={<Count n={PALETTES.length} />}>
              <div className="grid grid-cols-4 gap-2">
                {PALETTES.map((palette) => {
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
                          speed: gradientSpeed,
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
                          on ? "ring-ink" : "ring-transparent hover:ring-hairline-strong",
                        )}
                      >
                        {palette.colors.map((c) => (
                          <span key={c} className="flex-1" style={{ backgroundColor: c }} />
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

            <SpeedControl
              value={gradientSpeed}
              onChange={(speed) =>
                setScene({
                  kind: "Gradient",
                  styleId: gradientStyle,
                  paletteId: gradientPalette,
                  speed,
                })
              }
            />
          </>
        )}

        {/* ── Animated themes ──────────────────────────────────────────── */}
        {(listed("3D Animation") || hits?.presets.length) && (
          <Section
            title="3D Animation · presets"
            action={<Count n={SCENE_COUNTS.themes} />}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {(hits?.presets ?? THEME_PRESETS).map((preset) => (
                <Tile
                  key={preset.id}
                  label={preset.label}
                  sub={describeTheme(preset.themeId, preset.effectId)}
                  on={activePreset?.id === preset.id}
                  wide
                  onPick={() =>
                    setScene({
                      kind: "3D Animation",
                      themeId: preset.themeId,
                      effectId: preset.effectId,
                      speed: themeSpeed,
                    })
                  }
                >
                  <span
                    className="absolute inset-0"
                    style={{ backgroundImage: themeTint(preset.themeId) }}
                  />
                </Tile>
              ))}
            </div>
          </Section>
        )}

        {showing("3D Animation") && (
          <>
            <Section
              title="Theme"
              action={
                <span className="text-[11.5px] font-medium text-brand-red">
                  {activePreset ? activePreset.label : "Custom"}
                </span>
              }
            >
              <p className="mb-2.5 text-[12px] leading-snug text-ink-faint">
                {describeTheme(themeId, effectId)} — mix any theme with any
                effect, or start from a preset above.
              </p>
              <PillGrid
                items={THEME_VARIATIONS.map((v) => ({ id: v.id, label: v.label }))}
                activeId={themeId}
                onPick={(id) =>
                  setScene({
                    kind: "3D Animation",
                    themeId: id,
                    effectId,
                    speed: themeSpeed,
                  })
                }
              />
            </Section>

            <Section title="Effect" action={<Count n={THEME_EFFECTS.length + 1} />}>
              <PillGrid
                items={[
                  { id: "__none", label: "None" },
                  ...THEME_EFFECTS.map((e) => ({ id: e.id, label: e.label })),
                ]}
                activeId={effectId ?? "__none"}
                onPick={(id) =>
                  setScene({
                    kind: "3D Animation",
                    themeId,
                    effectId: id === "__none" ? null : id,
                    speed: themeSpeed,
                  })
                }
              />
            </Section>

            <SpeedControl
              value={themeSpeed}
              onChange={(speed) =>
                setScene({ kind: "3D Animation", themeId, effectId, speed })
              }
            />
          </>
        )}

        {/* ── Flat assets ──────────────────────────────────────────────── */}
        {(["Video BG", "Stills"] as const).map((kind) => {
          const items = (hits?.assets ?? ASSET_SCENES).filter((a) => a.kind === kind);
          if (!items.length || (!q && !listed(kind))) return null;
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
                {items.map((asset) => (
                  <Tile
                    key={asset.id}
                    label={asset.label}
                    on={
                      (scene.kind === "Video BG" || scene.kind === "Stills") &&
                      scene.id === asset.id
                    }
                    wide
                    onPick={() => setScene({ kind: asset.kind, id: asset.id })}
                  >
                    <span
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(145deg, ${asset.gradient})`,
                      }}
                    />
                  </Tile>
                ))}
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

/** 0 stops the motion entirely; the label says so rather than reading "0%". */
function SpeedControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Section
      title="Motion"
      action={
        <span className="text-[11.5px] tabular-nums text-ink-faint">
          {value === 0 ? "Still" : `${value}%`}
        </span>
      }
    >
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label="Motion speed"
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-red"
      />
      <p className="mt-1.5 text-[12px] text-ink-faint">
        Drag to nothing for a still scene. Reduced-motion settings are always
        respected regardless.
      </p>
    </Section>
  );
}

function PillGrid({
  items,
  activeId,
  onPick,
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="scroll-slim -mx-1 max-h-[176px] overflow-y-auto px-1">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const on = item.id === activeId;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onPick(item.id)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={springTight}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                on
                  ? "border-transparent bg-ink text-white"
                  : "border-hairline text-ink-soft hover:border-hairline-strong hover:text-ink",
              )}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
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
        <span className="mt-1 block truncate text-[10.5px] text-ink-faint">{sub}</span>
      )}
    </motion.button>
  );
}
