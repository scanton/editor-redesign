import { ellipsePoly, rectPoly } from "./lasso";
import type { CardDoc, Envelope } from "./types";

/** A single 5×7 panel, at the resolution the editor works in. */
export const PANEL_WIDTH = 1000;
export const PANEL_HEIGHT = 1400;

/** The inside is both panels at once — one 10×7 image across the fold. */
export const SPREAD_WIDTH = PANEL_WIDTH * 2;
export const SPREAD_HEIGHT = PANEL_HEIGHT;

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
 * Stand-in document for the demo. In the real editor these nodes come from the
 * card service; here they're hand-authored so the canvas has something with the
 * same shape to manipulate.
 */
export const sampleCard: CardDoc = {
  id: "card_graduate_legend",
  title: "Graduate. Hero. Legend.",
  faces: {
    front: {
      id: "front",
      label: "Front",
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
      background: "#1f3fd8",
      backgroundAccent: "#12239e",
      // Hand-authored stand-ins for what the segmentation model returns.
      segments: [
        {
          id: "front_bubble_seg",
          label: "Speech bubble",
          points: ellipsePoly(730, 180, 200, 105),
        },
        {
          id: "front_headline_seg",
          label: "Headline type",
          points: rectPoly(50, 880, 900, 410),
        },
        {
          id: "front_figure_seg",
          label: "Graduate",
          points: ellipsePoly(500, 560, 235, 310),
        },
        {
          id: "front_burst_seg",
          label: "Comic burst background",
          points: rectPoly(0, 0, PANEL_WIDTH, PANEL_HEIGHT),
        },
      ],
      nodes: [
        {
          id: "front_art",
          kind: "image",
          name: "Cover artwork",
          label: "Comic-burst graduate photo",
          src: "",
          x: 0,
          y: 0,
          width: PANEL_WIDTH,
          height: PANEL_HEIGHT,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
        },
        {
          id: "front_bubble",
          kind: "text",
          name: "Speech bubble",
          text: "FINALLY.",
          x: 560,
          y: 120,
          width: 340,
          fontSize: 76,
          fontFamily: "Fredoka",
          fontStyle: "bold",
          fill: "#16161a",
          align: "center",
          lineHeight: 1.1,
          letterSpacing: 1,
          rotation: -3,
          opacity: 1,
        },
        {
          id: "front_headline",
          kind: "text",
          name: "Headline",
          text: "GRADUATE.\nHERO.\nMAIN CHARACTER.\nLEGEND.",
          x: 60,
          y: 900,
          width: 880,
          fontSize: 96,
          fontFamily: "Fredoka",
          fontStyle: "bold",
          fill: "#ffd23f",
          align: "left",
          lineHeight: 1.02,
          letterSpacing: -1,
          rotation: 0,
          opacity: 1,
          stroke: "#16161a",
          strokeWidth: 6,
        },
      ],
    },

    inside: {
      id: "inside",
      label: "Inside",
      width: SPREAD_WIDTH,
      height: SPREAD_HEIGHT,
      background: "#1f3fd8",
      backgroundAccent: "#12239e",
      segments: [
        {
          id: "inside_bubble_seg",
          label: "Speech bubble",
          points: ellipsePoly(340, 190, 300, 120),
        },
        {
          id: "inside_message_seg",
          label: "Message type",
          points: rectPoly(1100, 190, 800, 560),
        },
        {
          id: "inside_figure_seg",
          label: "Graduate mid-jump",
          points: ellipsePoly(520, 760, 300, 380),
        },
        {
          id: "inside_burst_seg",
          label: "Comic burst background",
          points: rectPoly(0, 0, SPREAD_WIDTH, SPREAD_HEIGHT),
        },
      ],
      nodes: [
        {
          // One image across the whole spread — the art doesn't stop at the fold.
          id: "inside_art",
          kind: "image",
          name: "Inside spread artwork",
          label: "Full-spread comic burst — graduate mid-jump",
          src: "",
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
          id: "inside_bubble",
          kind: "text",
          name: "Speech bubble",
          text: "AND THEN:\nEVERYTHING.",
          x: 70,
          y: 90,
          width: 640,
          fontSize: 76,
          fontFamily: "Fredoka",
          fontStyle: "bold",
          fill: "#f7f0dd",
          align: "left",
          lineHeight: 1.08,
          letterSpacing: 0,
          rotation: 0,
          opacity: 1,
          stroke: "#16161a",
          strokeWidth: 8,
        },
        {
          // Lives on the right-hand panel of the spread.
          id: "inside_message",
          kind: "text",
          name: "Message",
          text: "You did the thing.\nAll those late nights.\nThe panic-studying.\nThe 2am texts.\nAnd you still walked\nacross that stage.",
          x: 1120,
          y: 210,
          width: 760,
          fontSize: 74,
          fontFamily: "Fredoka",
          fontStyle: "bold",
          fill: "#ffd23f",
          align: "center",
          lineHeight: 1.12,
          letterSpacing: 0,
          rotation: 0,
          opacity: 1,
          stroke: "#16161a",
          strokeWidth: 5,
        },
        {
          id: "inside_closing",
          kind: "text",
          name: "Closing",
          text: "Lots of love,",
          x: 1120,
          y: 940,
          width: 760,
          fontSize: 62,
          fontFamily: "Caveat",
          fontStyle: "normal",
          fill: "#f7f0dd",
          align: "center",
          lineHeight: 1.2,
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
          x: 1270,
          y: 1030,
          width: 460,
          height: 170,
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
      background: "#1f3fd8",
      backgroundAccent: "#0f1c7a",
      nodes: [
        {
          id: "back_mark",
          kind: "text",
          name: "Brand mark",
          text: "HeartStamp",
          x: 0,
          y: 1240,
          width: PANEL_WIDTH,
          fontSize: 38,
          fontFamily: "Fredoka",
          fontStyle: "normal",
          fill: "#ffffff",
          align: "center",
          lineHeight: 1.2,
          letterSpacing: 2,
          rotation: 0,
          opacity: 0.9,
        },
      ],
    },
  },
};
