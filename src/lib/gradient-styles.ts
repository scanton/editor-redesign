export interface GradientStyle {
  id: string;
  name: string;
  description: string;
}

export const GRADIENT_STYLES: GradientStyle[] = [
  { id: "halo", name: "Halo Spin", description: "A blurred color wheel rotating almost imperceptibly" },
  { id: "aurora", name: "Aurora Drift", description: "Soft glowing ribbons drifting like northern lights" },
  { id: "mesh", name: "Mesh Bloom", description: "Modern mesh gradient with gently breathing color pools" },
  { id: "silk", name: "Silk Waves", description: "Layered diagonal sheens sliding slowly across each other" },
  { id: "tide", name: "Rising Tide", description: "Soft swells of color washing along the bottom edge" },
  { id: "dawn", name: "First Light", description: "Banded sky with a sun-like orb slowly floating" },
  { id: "lumen", name: "Lumen", description: "Wandering spotlights over a deep, moody base" },
  { id: "prism", name: "Prism Veil", description: "Two counter-rotating color veils blending softly" },
  { id: "nebula", name: "Nebula", description: "A field of drifting cosmic color clouds" },
  { id: "ripple", name: "Still Water", description: "Concentric rings breathing outward from center" },
];
