import { PANEL_HEIGHT, PANEL_WIDTH } from "./sample-card";
import type { AnnotationRect } from "./types";

/**
 * Print geometry. A 5×7 panel is authored at 1000×1400, so 200px = 1 inch.
 *
 * Commercial trim tolerance is about 1/8", and anything within about 1/4" of
 * the edge reads as crowded once the card is cut — so text stays 0.3" clear.
 * Long-form blocks sit further in still, to leave the artwork somewhere to
 * breathe around them.
 */
export const PX_PER_INCH = PANEL_WIDTH / 5;
export const CUT_SAFE_MARGIN = Math.round(0.3 * PX_PER_INCH); // 60px
const ART_BREATHING_ROOM = Math.round(0.3 * PX_PER_INCH); // 60px

/**
 * Default long-form placement: most of the left-hand panel of the inside
 * spread, held off the trim edge and off the fold.
 */
export function defaultLongFormRect(): AnnotationRect {
  const inset = CUT_SAFE_MARGIN + ART_BREATHING_ROOM; // 120px ≈ 0.6"
  return {
    x: inset,
    y: inset + 60,
    width: PANEL_WIDTH - inset * 2,
    height: PANEL_HEIGHT - inset * 2 - 120,
  };
}

/** The printable region of a face — blocks are clamped inside it. */
export function safeArea(face: { width: number; height: number }) {
  return {
    x: CUT_SAFE_MARGIN,
    y: CUT_SAFE_MARGIN,
    width: face.width - CUT_SAFE_MARGIN * 2,
    height: face.height - CUT_SAFE_MARGIN * 2,
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
    label: "Letters & notes",
    options: [
      {
        id: "love-letter",
        label: "Love letter",
        blurb: "Unhurried and specific",
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
        id: "blessing",
        label: "Blessing",
        blurb: "A few lines of good wishes",
        shape: "verse",
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
        label: "Favourite memory",
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

export const LENGTHS: { value: LongFormLength; label: string; words: string }[] =
  [
    { value: "short", label: "Short", words: "~120 words" },
    { value: "medium", label: "Medium", words: "~250 words" },
    { value: "long", label: "Long", words: "~400 words" },
  ];

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
