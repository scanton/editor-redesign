import {
  PANEL_WIDTH,
  SPREAD_HEIGHT,
  SPREAD_WIDTH,
} from "./sample-card";
import type { AnnotationRect, FaceId } from "./types";

/**
 * Print geometry, derived from the artwork. The faces are not drawn at one
 * scale: a 5×7 panel is 1056×1488, so 211.2px to the inch, while the inside is
 * the whole 10×7 spread squeezed into 1488×1056, so 148.8px to the inch.
 * Anything measured in inches or points has to know which face it is on.
 */
export const PX_PER_INCH = PANEL_WIDTH / 5;
export const SPREAD_PX_PER_INCH = SPREAD_WIDTH / 10;

export function pxPerInch(face: FaceId) {
  return face === "inside" ? SPREAD_PX_PER_INCH : PX_PER_INCH;
}

/**
 * Commercial trim tolerance is about 1/8", and anything within about 1/4" of
 * the edge reads as crowded once the card is cut — so text stays 0.3" clear.
 * Long-form blocks sit further in still, to leave the artwork somewhere to
 * breathe around them.
 */
export const CUT_SAFE_INCHES = 0.3;
const ART_BREATHING_INCHES = 0.3;

export function cutSafeMargin(face: FaceId) {
  return Math.round(CUT_SAFE_INCHES * pxPerInch(face));
}

/**
 * Default long-form placement: the left-hand panel of the inside spread,
 * held off the trim edge and off the fold.
 *
 * Long-form is framed and rendered into the artwork, so it does not have to
 * wait for a gap in the design — it makes its own. The left panel is where it
 * goes, which also keeps it clear of the handwritten message, closing and
 * signature the customer fills in on the right.
 */
export function defaultLongFormRect(): AnnotationRect {
  const ppi = SPREAD_PX_PER_INCH;
  const inset =
    Math.round(CUT_SAFE_INCHES * ppi) + Math.round(ART_BREATHING_INCHES * ppi);
  // The fold runs down the middle of the spread.
  const fold = SPREAD_WIDTH / 2;
  return {
    x: inset / 2,
    y: inset,
    width: fold - inset,
    height: SPREAD_HEIGHT - inset * 2,
  };
}

/** The printable region of a face — blocks are clamped inside it. */
export function safeArea(face: { id: FaceId; width: number; height: number }) {
  const margin = cutSafeMargin(face.id);
  return {
    x: margin,
    y: margin,
    width: face.width - margin * 2,
    height: face.height - margin * 2,
  };
}

/** How the generated copy is shaped — drives the placeholder sample. */
export type LongFormShape = "prose" | "verse" | "list";

export type LongFormOption = {
  id: string;
  label: string;
  blurb: string;
  shape: LongFormShape;
};

export type LongFormGroup = {
  label: string;
  options: LongFormOption[];
};

export const LONG_FORM_GROUPS: LongFormGroup[] = [
  {
    label: "News & updates",
    options: [
      {
        id: "family-newsletter",
        label: "Family newsletter",
        blurb: "The year, household by household",
        shape: "prose",
      },
      {
        id: "year-in-review",
        label: "Year in review",
        blurb: "Highlights, month by month",
        shape: "list",
      },
      {
        id: "holiday-update",
        label: "Holiday update",
        blurb: "Warm catch-up for the season",
        shape: "prose",
      },
      {
        id: "baby-announcement",
        label: "Baby announcement",
        blurb: "Name, date, and the whole story",
        shape: "prose",
      },
    ],
  },
  {
    label: "Letters & notes",
    options: [
      {
        id: "love-letter",
        label: "Love letter",
        blurb: "Unhurried and specific",
        shape: "prose",
      },
      {
        id: "apology-letter",
        label: "Apology letter",
        blurb: "Owns it, without the excuses",
        shape: "prose",
      },
      {
        id: "open-letter",
        label: "Open letter",
        blurb: "Something you've wanted to say",
        shape: "prose",
      },
      {
        id: "thank-you",
        label: "Thank-you note",
        blurb: "Names the thing they actually did",
        shape: "prose",
      },
      {
        id: "advice",
        label: "Advice & wishes",
        blurb: "What you'd tell them starting out",
        shape: "list",
      },
    ],
  },
  {
    label: "Verse & song",
    options: [
      {
        id: "poem",
        label: "Poem",
        blurb: "Free verse, written for them",
        shape: "verse",
      },
      {
        id: "haiku",
        label: "Haiku",
        blurb: "Seventeen syllables, one moment",
        shape: "verse",
      },
      {
        id: "limerick",
        label: "Limerick",
        blurb: "Five lines, slightly ridiculous",
        shape: "verse",
      },
      {
        id: "song-lyric",
        label: "Song lyric",
        blurb: "A verse and a chorus",
        shape: "verse",
      },
    ],
  },
  {
    label: "Milestones",
    options: [
      {
        id: "graduate-letter",
        label: "Letter to a graduate",
        blurb: "For the one who just finished",
        shape: "prose",
      },
      {
        id: "retirement-letter",
        label: "Retirement letter",
        blurb: "A working life, properly thanked",
        shape: "prose",
      },
      {
        id: "newborn-letter",
        label: "Letter to a newborn",
        blurb: "For them to read when they're grown",
        shape: "prose",
      },
      {
        id: "coming-of-age-letter",
        label: "Coming-of-age letter",
        blurb: "For the day they grow up a little",
        shape: "prose",
      },
    ],
  },
  {
    label: "Occasions",
    options: [
      {
        id: "toast",
        label: "Toast",
        blurb: "Short enough to read aloud",
        shape: "prose",
      },
      {
        id: "tribute",
        label: "Tribute",
        blurb: "For someone worth remembering",
        shape: "prose",
      },
      {
        id: "vows",
        label: "Wedding vows",
        blurb: "Promises, in your own words",
        shape: "verse",
      },
    ],
  },
  {
    label: "Speeches",
    options: [
      {
        id: "wedding-speech",
        label: "Wedding speech",
        blurb: "For whoever is holding the microphone",
        shape: "prose",
      },
      {
        id: "farewell-speech",
        label: "Farewell speech",
        blurb: "A goodbye, read aloud",
        shape: "prose",
      },
      {
        id: "roast",
        label: "Roast",
        blurb: "Affectionate, and a little merciless",
        shape: "prose",
      },
    ],
  },
  {
    label: "Faith & legacy",
    options: [
      {
        id: "sermon",
        label: "Sermon",
        blurb: "The heart of the message",
        shape: "prose",
      },
      {
        id: "blessing",
        label: "Blessing",
        blurb: "A few lines of good wishes",
        shape: "verse",
      },
      {
        id: "legacy-letter",
        label: "Legacy letter",
        blurb: "What you want them to carry on",
        shape: "prose",
      },
      {
        id: "open-later-letter",
        label: "Letter to open later",
        blurb: "Sealed until the moment comes",
        shape: "prose",
      },
    ],
  },
  {
    label: "Support & loss",
    options: [
      {
        id: "celebration-of-life-bio",
        label: "Celebration of life bio",
        blurb: "A life, told for the people who gather",
        shape: "prose",
      },
      {
        id: "sympathy-letter",
        label: "Sympathy letter",
        blurb: "Plain words for a hard time",
        shape: "prose",
      },
      {
        id: "get-well-letter",
        label: "Get well letter",
        blurb: "Company while they recover",
        shape: "prose",
      },
      {
        id: "encouragement-letter",
        label: "Encouragement letter",
        blurb: "For when the going is hard",
        shape: "prose",
      },
      {
        id: "pet-memorial",
        label: "Pet memorial",
        blurb: "For the one who waited by the door",
        shape: "prose",
      },
    ],
  },
  {
    label: "Keepsakes",
    options: [
      {
        id: "recipe",
        label: "Recipe",
        blurb: "The one everyone asks for",
        shape: "list",
      },
      {
        id: "short-story",
        label: "Short story",
        blurb: "A page of fiction, starring them",
        shape: "prose",
      },
      {
        id: "memory",
        label: "Favorite memory",
        blurb: "One day, told properly",
        shape: "prose",
      },
      {
        id: "top-ten",
        label: "Top ten list",
        blurb: "Ten reasons, counted down",
        shape: "list",
      },
    ],
  },
];

export const LONG_FORM_OPTIONS = LONG_FORM_GROUPS.flatMap((g) => g.options);

export function findLongForm(id: string | null) {
  return LONG_FORM_OPTIONS.find((o) => o.id === id) ?? null;
}

export type LongFormLength = "short" | "medium" | "long";

/**
 * The smallest type we will set on a printed card. Below about 9pt a card held
 * at arm's length stops being readable, and a block that has quietly shrunk to
 * fit is worse than one that plainly did not.
 */
export const MIN_PRINT_PT = 9;

/** Points to card pixels, at the scale of the face the type is set on. */
export function ptToPx(pt: number, ppi: number) {
  return (pt / 72) * ppi;
}

/**
 * Length is a type size, not a word count.
 *
 * A fixed word count cannot be a promise about anything, because the block
 * auto-fits: the same 250 words are comfortable in a big box and unreadable in
 * a small one. Naming the size instead makes the promise the one that matters,
 * and the word budget falls out of the size and the box together.
 */
export const LENGTHS: { value: LongFormLength; label: string; pt: number }[] = [
  { value: "short", label: "Short", pt: 14 },
  { value: "medium", label: "Medium", pt: 11 },
  { value: "long", label: "Long", pt: MIN_PRINT_PT },
];

export function findLength(value: LongFormLength) {
  return LENGTHS.find((l) => l.value === value)!;
}

/** How many words a box holds at a given type size, by the fitter's own maths. */
export function wordCapacity(
  width: number,
  height: number,
  pt: number,
  ppi: number,
) {
  const size = ptToPx(pt, ppi);
  const perLine = Math.max(1, Math.floor(width / (size * AVG_GLYPH)));
  const lines = Math.max(1, Math.floor(height / (size * LONG_FORM_LEADING)));
  return Math.floor((perLine * lines) / CHARS_PER_WORD);
}

/**
 * What to ask the writer for: the target is what fits at the chosen size, and
 * the maximum is what fits at the smallest size we will print. Past the
 * maximum there is no size left to shrink to.
 */
export function wordBudget(
  rect: { width: number; height: number },
  length: LongFormLength,
  ppi: number,
) {
  return {
    target: wordCapacity(rect.width, rect.height, findLength(length).pt, ppi),
    max: wordCapacity(rect.width, rect.height, MIN_PRINT_PT, ppi),
    minPt: MIN_PRINT_PT,
  };
}

/** True when the words cannot be set inside the box without going under 9pt. */
export function overflowsBox(
  text: string,
  rect: { width: number; height: number },
  ppi: number,
) {
  if (!text.trim()) return false;
  return (
    estimateHeight(
      text,
      rect.width,
      ptToPx(MIN_PRINT_PT, ppi),
      LONG_FORM_LEADING,
    ) > rect.height
  );
}

/**
 * Placeholder copy so the demo can show text actually flowing into the block.
 * The agent would return real writing here.
 */
const SAMPLES: Record<LongFormShape, string> = {
  prose: `It has been a year, hasn't it.

We started it in a house we hadn't unpacked, with a dog who had opinions about the stairs, and somehow we are ending it with all the boxes gone and the dog asleep on the landing like he owns it.

There were the ordinary things — school runs, a leaking roof, one memorable birthday cake — and then there was the day in June none of us will forget, standing in the rain, laughing, completely soaked.

Thank you for being part of it. We hope this year has been kind to you, and if it hasn't, we hope this next one makes up for it.`,
  verse: `You did the thing you said you'd do,
the slow way, the hard way, the true way —

past the late nights and the lost weeks,
past the version of you that nearly stopped,

all the way to here,
where we are standing, waiting,
so proud of you it aches.`,
  list: `One. You showed up, every time.

Two. You made the hard thing look like a choice, not a burden.

Three. You never once let us feel like we were in the way.

Four. You laughed at the joke even the second time.

Five. You remembered the small thing we mentioned once.

Six. You have been, quietly and without fuss, the best of us.`,
};

export function sampleFor(shape: LongFormShape) {
  return SAMPLES[shape];
}

/* ------------------------------------------------------------- the approach */

/**
 * How the words get made. Picking a kind is only half the question — the other
 * half is how much of the writing the customer wants to do, which is a
 * conversation with the agent rather than a setting on a panel.
 */
export type LongFormApproach = "paste" | "polish" | "bullets" | "write";

export const APPROACHES: {
  id: LongFormApproach;
  label: string;
  blurb: string;
  /** What the agent asks for next. */
  ask: string;
  placeholder: string;
  /** The button that ends the exchange. */
  cta: string;
  /** How long the stub pretends to work. Pasting is not writing. */
  delay: number;
}[] = [
  {
    id: "paste",
    label: "I've already written it",
    blurb: "Use my words as they are",
    ask: "Paste it in and I'll set it on the card exactly as you wrote it.",
    placeholder: "Paste your text…",
    cta: "Place it",
    delay: 500,
  },
  {
    id: "polish",
    label: "Help me polish it",
    blurb: "I have a draft, tidy it up",
    ask: "Paste your draft. I'll keep your voice and fix the rest — spelling, rhythm, the bits that run on.",
    placeholder: "Paste your draft…",
    cta: "Polish it",
    delay: 1800,
  },
  {
    id: "bullets",
    label: "I'll give you the bullets",
    blurb: "You turn them into prose",
    ask: "Give me the beats — one per line. Names, dates, the thing everyone will remember.",
    placeholder: "Moved house in March\nDog finally likes the stairs\nJune, the rain, all of us laughing",
    cta: "Write it up",
    delay: 2400,
  },
  {
    id: "write",
    label: "You write it",
    blurb: "I'll tell you about them",
    ask: "Tell me who it's for and what you want them to feel. A sentence is plenty.",
    placeholder: "For my sister, who just finished nursing school…",
    cta: "Write it for me",
    delay: 2800,
  },
];

export function findApproach(id: LongFormApproach | null) {
  return APPROACHES.find((a) => a.id === id) ?? null;
}

/* ----------------------------------------------------------- fitting to fit */

/**
 * Long-form copy is set to fill the box it was given rather than to a fixed
 * size — a paragraph in a small box is small type, the same paragraph in a big
 * one is big. Resize the box and the text refits.
 *
 * Measured by estimate rather than by the canvas: this runs on every drag
 * frame, and a metrics call per candidate size would cost more than the
 * accuracy is worth.
 */
const AVG_GLYPH = 0.5;
/** Leading the block is set with, shared by the fitter and the store. */
export const LONG_FORM_LEADING = 1.45;
/** Rough words per character, for turning box area into a word budget. */
const CHARS_PER_WORD = 5.5;

function estimateHeight(
  text: string,
  width: number,
  size: number,
  lineHeight: number,
) {
  const perLine = Math.max(1, Math.floor(width / (size * AVG_GLYPH)));
  let lines = 0;

  for (const paragraph of text.split("\n")) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines += 1;
      continue;
    }
    // Wrap the way text actually wraps — at word boundaries. Counting
    // characters instead treats every line as perfectly full, which
    // undercounts the lines a short phrase really takes and lets the block
    // overflow its box.
    let used = 0;
    let count = 1;
    for (const word of words) {
      const needed = used === 0 ? word.length : word.length + 1;
      if (used + needed > perLine && used > 0) {
        count += 1;
        used = word.length;
      } else {
        used += needed;
      }
    }
    lines += count;
  }

  return lines * size * lineHeight;
}

/**
 * The size that fills the box without spilling out of it, never going below
 * what we are willing to print. When even the floor will not hold the text,
 * the floor is what comes back and the block overflows visibly: better seen in
 * the editor than discovered in the post.
 */
export function fitFontSize(
  text: string,
  width: number,
  height: number,
  ppi: number,
  lineHeight = LONG_FORM_LEADING,
  { min = ptToPx(MIN_PRINT_PT, ppi), max = 110 } = {},
) {
  if (!text.trim() || width <= 0 || height <= 0) return min;
  for (let size = max; size > min; size -= 1) {
    if (estimateHeight(text, width, size, lineHeight) <= height) return size;
  }
  return min;
}

/* ------------------------------------------------------------- the frame */

/**
 * What to do with the artwork under a frame. The panel has to come from
 * somewhere, and there is no single right answer: laying it on top is quick
 * and keeps the art intact, moving the art around it keeps both, and clearing
 * the space under it is the surest way to be read. That is a decision about
 * someone's card, so the agent asks rather than picks.
 */
export type FrameTreatment = "overlay" | "blend" | "rearrange" | "clear";

export const FRAME_TREATMENTS: {
  id: FrameTreatment;
  label: string;
  blurb: string;
  /** The stub's panel fill, so the four read differently on the card. */
  fill: string;
  /** What the panel says afterwards. */
  done: string;
  delay: number;
}[] = [
  {
    id: "overlay",
    label: "Set it on top",
    blurb: "Quickest. The artwork stays exactly as it is, under the panel.",
    fill: "rgba(250,248,243,0.86)",
    done: "The panel sits on the artwork, which is untouched underneath.",
    delay: 1400,
  },
  {
    id: "blend",
    label: "Blend it into the art",
    blurb: "The panel is worked into the design, so it reads as drawn there.",
    fill: "rgba(250,248,243,0.72)",
    done: "The panel was worked into the artwork rather than laid over it.",
    delay: 2800,
  },
  {
    id: "rearrange",
    label: "Move the art around it",
    blurb: "Nothing important ends up underneath. Keeps every piece of the art.",
    fill: "rgba(250,248,243,0.92)",
    done: "The artwork was re-laid so nothing important sits under the words.",
    delay: 3400,
  },
  {
    id: "clear",
    label: "Clear the space",
    blurb: "The art under the panel goes. The easiest to read, the least busy.",
    fill: "#faf8f3",
    done: "The artwork under the panel was cleared.",
    delay: 2200,
  },
];

export function findFrameTreatment(id: FrameTreatment | null) {
  return FRAME_TREATMENTS.find((t) => t.id === id) ?? null;
}
