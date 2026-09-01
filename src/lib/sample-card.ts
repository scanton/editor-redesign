import type { CardDoc, Envelope } from "./types";

/**
 * A real card, at the resolution its artwork was rendered at. Front and back
 * are single 5x7 panels; the inside is the 10x7 spread across the fold, drawn
 * as one image at a lower ppi.
 */
export const PANEL_WIDTH = 1056;
export const PANEL_HEIGHT = 1488;
export const SPREAD_WIDTH = 1488;
export const SPREAD_HEIGHT = 1056;

export const defaultEnvelope: Envelope = {
  flap: "euro",
  font: "Arima",
  sender: {
    name: "John Smith",
    line1: "5678 Rolling Drive",
    line2: "Poughkeepsie, NY 88114",
  },
  recipient: {
    name: "Trish Sparks",
    line1: "129 E. Fremont Dr.",
    line2: "Las Vegas, NV 89101",
  },
};

/**
 * The card the editor opens on. The artwork is a finished render with its own
 * type baked in — which is exactly why the message and headline are not text
 * nodes here, and why changing them has to go through the agent.
 *
 * Segments are traced from the artwork: the neon backdrops come from a colour
 * mask, the objects are hand-authored and checked against an overlay. Ordered
 * most-specific first, so hit-testing picks the figure before the background
 * it stands on.
 */
export const sampleCard: CardDoc = {
  id: "card_officially_finally",
  title: "Officially, Finally, a Graduate",
  faces: {
    front: {
      id: "front",
      label: "Front",
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
      background: "#c8e814",
      segments: [
        {
          id: "front_headline_seg",
          label: "Headline type",
          points: [
            215, 235, 915, 235, 915, 585, 215, 585,
          ],
        },
        {
          id: "front_cap_seg",
          label: "Graduation cap",
          points: [
            884, 712, 876, 743, 852, 772, 813, 797, 763, 816,
            705, 828, 642, 832, 579, 828, 521, 816, 471, 797,
            432, 772, 408, 743, 400, 712, 408, 681, 432, 652,
            471, 627, 521, 608, 579, 596, 642, 592, 705, 596,
            763, 608, 813, 627, 852, 652, 876, 681,
          ],
        },
        {
          id: "front_diploma_seg",
          label: "Diploma",
          points: [
            222, 985, 315, 962, 412, 1330, 352, 1408, 262, 1392,
            178, 1048,
          ],
        },
        {
          id: "front_circle_seg",
          label: "Pink circle",
          points: [
            494, 1095, 486, 1151, 464, 1202, 429, 1247, 383,
            1281, 329, 1303, 272, 1310, 215, 1303, 161, 1281,
            115, 1247, 80, 1202, 58, 1151, 50, 1095, 58, 1039,
            80, 988, 115, 943, 161, 909, 215, 887, 272, 880,
            329, 887, 383, 909, 429, 943, 464, 987, 486, 1039,
          ],
        },
        {
          id: "front_figure_seg",
          label: "Graduate",
          points: [
            400, 700, 475, 612, 695, 604, 802, 722, 818, 905,
            872, 1150, 878, 1488, 252, 1488, 238, 1330, 302,
            1148, 348, 980, 362, 828,
          ],
        },
        {
          id: "front_neon_seg",
          label: "Neon backdrop",
          points: [
            640, 0, 656, 64, 736, 128, 960, 192, 976, 256, 928,
            320, 992, 384, 992, 448, 1008, 512, 1040, 576, 1040,
            640, 976, 704, 944, 768, 912, 832, 336, 896, 816,
            1088, 800, 1136, 720, 1072, 0, 880, 0, 816, 64, 752,
            16, 688, 0, 624, 32, 560, 0, 496, 16, 432, 48, 368,
            80, 304, 160, 240, 192, 176, 256, 112, 320, 48,
          ],
        },
        {
          id: "front_collage_seg",
          label: "Collage background",
          points: [
            0, 0, 1056, 0, 1056, 1488, 0, 1488,
          ],
        },
      ],
      nodes: [
        {
          id: "front_art",
          kind: "image",
          name: "Front artwork",
          label: "Officially, Finally, a Graduate",
          src: "/images/graduation-card-front.png",
          x: 0,
          y: 0,
          width: PANEL_WIDTH,
          height: PANEL_HEIGHT,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
        },
      ],
    },

    inside: {
      id: "inside",
      label: "Inside",
      width: SPREAD_WIDTH,
      height: SPREAD_HEIGHT,
      background: "#c8e814",
      segments: [
        {
          id: "inside_message_seg",
          label: "Message type",
          points: [
            890, 258, 1435, 258, 1435, 578, 890, 578,
          ],
        },
        {
          id: "inside_cap_seg",
          label: "Graduation cap",
          points: [
            587, 462, 582, 486, 567, 508, 543, 527, 512, 542,
            476, 551, 437, 554, 398, 551, 362, 542, 331, 527,
            307, 508, 292, 486, 287, 462, 292, 438, 307, 416,
            331, 397, 362, 382, 398, 373, 437, 370, 476, 373,
            512, 382, 543, 397, 567, 416, 582, 438,
          ],
        },
        {
          id: "inside_figure_seg",
          label: "Graduate",
          points: [
            238, 198, 322, 188, 348, 418, 432, 396, 558, 380,
            598, 188, 682, 198, 702, 442, 772, 602, 802, 762,
            796, 1056, 196, 1056, 202, 762, 232, 602, 274, 430,
          ],
        },
        {
          id: "inside_grid_seg",
          label: "Grid paper",
          points: [
            120, 150, 330, 96, 600, 108, 782, 190, 800, 470,
            762, 660, 560, 700, 300, 690, 100, 600, 92, 330,
          ],
        },
        {
          id: "inside_circle_seg",
          label: "Pink circle",
          points: [
            623, 355, 615, 424, 591, 489, 553, 545, 504, 587,
            447, 614, 385, 623, 323, 614, 266, 587, 217, 545,
            179, 489, 155, 424, 147, 355, 155, 286, 179, 221,
            217, 165, 266, 123, 323, 96, 385, 87, 447, 96, 504,
            123, 553, 165, 591, 221, 615, 286,
          ],
        },
        {
          id: "inside_neon_seg",
          label: "Neon backdrop",
          points: [
            0, 0, 1488, 0, 1488, 1056, 0, 1056,
          ],
        },
      ],
      nodes: [
        {
          // One image across the whole spread — the art does not stop at the fold.
          id: "inside_art",
          kind: "image",
          name: "Inside artwork",
          label: "You survived the chaos and still graduated",
          src: "/images/graduation-card-inside.png",
          x: 0,
          y: 0,
          width: SPREAD_WIDTH,
          height: SPREAD_HEIGHT,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
        },
        {
          // The printed greeting is part of the artwork; what the customer
          // writes sits beneath it, in the space the design leaves clear.
          id: "inside_message",
          kind: "text",
          name: "Message",
          text: "Four years, a hundred late nights\nand one very loud graduation cap.\nWe could not be prouder of you.",
          x: 890,
          y: 640,
          width: 545,
          fontSize: 40,
          fontFamily: "Caveat",
          fontStyle: "normal",
          fill: "#242423",
          align: "left",
          lineHeight: 1.35,
          letterSpacing: 0,
          rotation: 0,
          opacity: 1,
        },
        {
          id: "inside_closing",
          kind: "text",
          name: "Closing",
          text: "Lots of love,",
          x: 890,
          y: 812,
          width: 545,
          fontSize: 40,
          fontFamily: "Caveat",
          fontStyle: "normal",
          fill: "#242423",
          align: "left",
          lineHeight: 1.3,
          letterSpacing: 0,
          rotation: 0,
          opacity: 1,
        },
        {
          id: "inside_signature",
          kind: "draw",
          name: "Signature",
          strokes: [],
          sourceWidth: 432,
          sourceHeight: 160,
          x: 900,
          y: 862,
          width: 330,
          height: 122,
          rotation: 0,
          opacity: 1,
        },
      ],
    },

    back: {
      id: "back",
      label: "Back",
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
      background: "#c8e814",
      segments: [
        {
          id: "back_neon_seg",
          label: "Neon backdrop",
          points: [0, 0, 1056, 0, 1056, 1488, 0, 1488],
        },
      ],
      nodes: [
        {
          id: "back_art",
          kind: "image",
          name: "Back artwork",
          label: "Back",
          src: "/images/graduation-card-back.png",
          x: 0,
          y: 0,
          width: PANEL_WIDTH,
          height: PANEL_HEIGHT,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
        },
      ],
    },
  },
};
