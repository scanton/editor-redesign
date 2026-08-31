/**
 * The real style library, transcribed from the production catalogue: 23 groups,
 * 268 styles. Only the representative styles per group are listed here — the
 * full set and its thumbnails come from the style service.
 */
export type ArtStyle = { id: string; label: string };
export type ArtStyleGroup = {
  id: string;
  label: string;
  /** How many the group holds in production, not how many are listed here. */
  count: number;
  styles: ArtStyle[];
};

const g = (
  id: string,
  label: string,
  count: number,
  styles: string[],
): ArtStyleGroup => ({
  id,
  label,
  count,
  styles: styles.map((s) => ({ id: s.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: s })),
});

export const STYLE_GROUPS: ArtStyleGroup[] = [
  g("cinematic", "Cinematic & Magazine", 22, [
    "Ethereal Glitter Portrait",
    "Cinematic Film Still",
    "Dramatic Editorial Portrait",
    "Ethereal Grain Gradient",
    "Intimate Newborn Editorial",
    "Theatrical Cinema Glamour",
  ]),
  g("cottagecore", "Cottagecore & Florals", 24, [
    "Delicate Wildflower Meadow",
    "Cottagecore Watercolor Stationery",
    "Maximalist Painterly Florals",
    "Scandi Folk Whimsy",
  ]),
  g("scrapbook", "Scrapbook & Keepsake", 18, [
    "Curated Botanical Scrapbook",
    "Pressed Flower Journal Art",
    "Luxury Tactile Photo Scrapbook",
    "Die-Cut Sticker Pack Collage",
  ]),
  g("vintage-film", "Vintage Film", 18, [
    "Aged Polaroid Light Leak",
    "70's Sun-Drenched Glamour",
    "Nostalgic Studio Portrait",
    "Lo Fi Disposable Flash",
  ]),
  g("neon", "Neon Nights", 16, [
    "Neon Rain Street Cinematic",
    "Neon Dreamcore",
    "Fever Dream Romance",
    "Neon Street Art Glow",
  ]),
  g("elegant", "Elegant & Timeless", 15, [
    "Gilded Botanical Tapestry",
    "Romantic French Line Art",
    "Coquette Bow Aesthetic",
    "Deep Emboss & Letterpress",
  ]),
  g("punk", "Punk & Unhinged", 14, [
    "Punk Zine Cutout Collage",
    "Eccentric Grunge Collage",
    "Pastel Goth Creepy Cute Scrapbook",
    "Urban Acid Glitch Collage",
  ]),
  g("covers", "Covers, Tickets & Posters", 13, [
    "Magazine Cover Photo Card",
    "Vintage Concert Poster",
    "Graphic Playing Card",
    "Vintage Ticket Style",
  ]),
  g("hand-painted", "Hand Painted", 12, [
    "Vibrant Sumi-e Watercolor",
    "Painterly Editorial Caricature",
    "Midcentury Commercial Gouache",
    "Chic Hand Drawn Doodle",
    "Whimsical Wanderlust Watercolor",
    "Vintage Sketchbook & Colored Pencil",
  ]),
  g("retro-pop", "Retro Pop", 12, [
    "1960s Mod Pop Graphic",
    "Retro Halftone Gig Poster",
    "Psychedelic 70s Kodachrome",
    "Vibrant Candy Pop Realism",
  ]),
  g("zine", "Zine & Moodboard", 11, [
    "Aesthetic Curated Moodboard",
    "Gilded Grunge Collage",
    "Retro Surrealist Zine Collage",
    "Archival Poster Collage",
  ]),
  g("dark-romance", "Dark Romance", 11, [
    "Dark Baroque Masquerade",
    "Dark Fairy Tale Ink Wash",
    "Opulent Rococo Fantasy",
    "Pastel Macabre Surrealism",
  ]),
  g("ink-bold", "Ink & Bold Prints", 10, [
    "Vibrant Pop-Art Linocut",
    "Duotone Block Print Graphic",
    "Retro Risograph Overlay",
    "Retro Ukiyo Pop",
  ]),
  g("anime-comics", "Anime & Comics", 10, [
    "Cinematic Anime Scenery",
    "Retro Anime Romance",
    "Gritty Urban Manga Sketch",
    "Neo Superflat Urban Toy",
  ]),
  g("storybook", "Storybook & Kids", 10, [
    "Ethereal Pastel Storybook",
    "Messy Storybook Watercolor",
    "Whimsical Gouache Illustration",
    "Naive Primary Pop Doodle",
  ]),
  g("words-type", "Words & Type", 8, [
    "Vibrant Retro Poster Typography",
    "Ornate Typographic Word Cloud",
    "Halftone Editorial Dither",
    "Whimsical Typographic Word Art",
  ]),
  g("fantasy", "Fantasy & Sci-Fi", 8, [
    "Luminous Prismatic Dreamscape",
    "Vintage Sci-Fi Pulp Magazine",
    "Fantasy Impasto Pure Magic",
    "Dark Pulp Illustration",
  ]),
  g("cut-paper", "Cut Paper Art", 7, [
    "Sculpted Paper Relief",
    "Dimensional Layered Papercraft",
    "Intricate Paper Quilling",
    "Pastel 3D Paper Frame",
  ]),
  g("y2k", "Y2K & Online", 7, [
    "Y2K Chrome Feminine",
    "Authentic Gen Z Selfie",
    "Playful Pixel Flash Doodle",
    "Y2K Nostalgic Diary Scrapbook",
  ]),
  g("stitched", "Stitched & Sewn", 6, [
    "Handmade Embroidery Hoop Art",
    "Patchwork Quilt Style",
    "Vibrant Punch Needle Tufting",
    "Soft Knit Anthropomorph Studio",
  ]),
  g("your-photo", "Add Your Photo", 6, [
    "Hanging Polaroid Gallery",
    "Illustrated Botanical Border Photo",
    "Polaroid Scatter Flatlay",
    "Aesthetic Year-in-Review Grid",
  ]),
  g("toys-clay", "Toys & Claymation", 5, [
    "Soft 3D Toy Render",
    "Cozy Stop-Motion Craft",
    "Atmospheric Miniature Diorama",
    "Euphoric 3D Animation Spark",
  ]),
  g("sports", "Sports & Action", 5, [
    "Premium Sports Trading Card",
    "Elite Sports Magazine Cover",
    "Minimalist Geometric Sport",
    "Vintage Heritage Collector Card",
  ]),
];

export const TOTAL_STYLES = STYLE_GROUPS.reduce((n, g) => n + g.count, 0);
export const ALL_STYLES = STYLE_GROUPS.flatMap((g) => g.styles);

/** Shown first, before any group is opened. */
export const POPULAR_STYLE_IDS = [
  "ethereal-glitter-portrait",
  "vibrant-sumi-e-watercolor",
  "sculpted-paper-relief",
  "soft-3d-toy-render",
  "whimsical-gouache-illustration",
  "retro-ukiyo-pop",
];

export function findStyle(id: string | null) {
  return ALL_STYLES.find((s) => s.id === id) ?? null;
}
