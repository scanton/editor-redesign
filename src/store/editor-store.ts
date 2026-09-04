"use client";

import { create } from "zustand";
import { defaultEnvelope, sampleCard } from "@/lib/sample-card";
import {
  DEFAULT_QR,
  clampQr,
  invitationDoc,
  type QrShape,
  type RsvpMethod,
  type ScheduleRow,
} from "@/lib/invitation";
import {
  DETAIL_TYPES,
  MAX_PRINTED,
  SEED_TYPES,
  findDetailType,
  printedRows,
  sortRows,
  type DetailRow,
} from "@/lib/event-details";
import { SWITCHER_INSET, TOOLBAR_INSET } from "@/lib/card-transform";
import {
  defaultLongFormRect,
  findLongForm,
  sampleFor,
  type LongFormLength,
} from "@/lib/long-form";
import {
  REVEAL_STEPS,
  type CoverLayout,
  type Scene,
} from "@/lib/digital-card";
import type {
  Orientation,
  Product,
  AnnotationRect,
  AnnotationRequest,
  CanvasMode,
  CardType,
  Surface,
  Segment,
  Step,
  CardDoc,
  EditorNode,
  Envelope,
  FaceId,
  ToolId,
} from "@/lib/types";
import { boundsOf, paintedBounds } from "@/lib/lasso";
import { STEP_DEFAULT_TOOL, stepTools } from "@/lib/steps";
import type {
  DigitalDelivery,
  PrintedDelivery,
  Recipient,
} from "@/lib/fulfilment";
import { ENVELOPE_ADD_ON, priceOf, unitPrice } from "@/lib/pricing";
import { clamp, uid } from "@/lib/utils";

const MAX_HISTORY = 50;

/** Single long-form block per card, so it can be replaced rather than stacked. */
export const LONG_FORM_NODE_ID = "long_form_block";

/**
 * Breathing room around the card. The vertical figure has to clear both pieces
 * of floating chrome — mode toolbar on top, face switcher below.
 */
const CANVAS_PADDING_X = 120;
const CANVAS_PADDING_Y = TOOLBAR_INSET + SWITCHER_INSET + 90;

type EditorState = {
  doc: CardDoc;
  face: FaceId;
  activeTool: ToolId | null;

  /**
   * Greeting cards or invitations. Each product keeps its own document and
   * history, so switching lines never costs you the work on the other.
   */
  product: Product;
  setProduct: (product: Product) => void;

  /**
   * Invitations carry structured event data rather than a written message.
   * The image model bakes it into the back panel, which is why changing a
   * printed field leaves the render behind the data rather than editing it.
   */
  invitation: {
    orientation: Orientation;
    /**
     * The dynamic detail list. Rows carry a type rather than a fixed label, so
     * a date gets a date picker and a dress code gets its options. The last row
     * is always blank, which is what lets the list grow without an Add button.
     */
    details: DetailRow[];
    schedule: ScheduleRow[];
    rsvpOn: boolean;
    rsvpMethod: RsvpMethod;
    rsvpValue: string;
    rsvpDeadline: string;
    rsvpLine: string;
    qrOn: boolean;
    qrShape: QrShape;
    /** Fractions of the panel, so the code survives an orientation change. */
    qr: { x: number; y: number; width: number };
    /** The artwork is behind the data and needs a new render. */
    stale: boolean;
    rendering: boolean;
  };
  /**
   * Patching event data. Anything that reaches the artwork leaves the render
   * stale; the QR is composited by the editor afterwards, so moving it never
   * does.
   */
  setInvitation: (patch: Partial<EditorState["invitation"]>) => void;
  setOrientation: (orientation: Orientation) => void;
  /** Give a blank row a type, or change one — which resets what it holds. */
  setDetailType: (id: string, type: string) => void;
  updateDetail: (id: string, patch: Partial<DetailRow>) => void;
  removeDetail: (id: string) => void;
  setSchedule: (rows: ScheduleRow[]) => void;
  moveQr: (pos: { x: number; y: number }, width?: number) => void;
  /** Hand the details back to the model and wait for new artwork. */
  renderInvitation: () => void;

  /** Create → Personalize → Finish. The rail regroups per step. */
  step: Step;
  setStep: (step: Step) => void;
  /** One card, two saved renditions. Switching never discards the other. */
  cardType: CardType;
  setCardType: (type: CardType) => void;

  /** The canvas shows the card or the envelope it arrives in. */
  surface: Surface;
  setSurface: (surface: Surface) => void;

  /** Digital rendition: the scene behind the card, how it opens, what they read first. */
  digital: {
    scene: Scene;
    backgroundTab: string;
    envelopeLook: string | null;
    envelopeColour: string;
    /** Which part of the envelope the fine-tune rows are showing. */
    envelopeDecorPart: "liner" | "stamp" | "seal";
    envelopeLiner: string;
    envelopeStamp: string;
    envelopeSeal: string;
    reveal: {
      preset: string;
      /** Step ids in play order; reorderable. */
      sequence: string[];
      skipped: string[];
      music: boolean;
      reducedMotion: boolean;
    };
    cover: {
      on: boolean;
      showSender: boolean;
      showAvatar: boolean;
      layout: CoverLayout;
    };
  };
  setDigital: (patch: Partial<EditorState["digital"]>) => void;

  /** Finish: how it reaches them, who gets it, and what that costs. */
  fulfilment: {
    digitalDelivery: DigitalDelivery;
    printedDelivery: PrintedDelivery;
    recipients: Recipient[];
    quantity: number;
  };
  setFulfilment: (patch: Partial<EditorState["fulfilment"]>) => void;
  addRecipient: () => void;
  updateRecipient: (id: string, patch: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  /**
   * Envelopes come with a greeting card. On printed invitations they are an
   * add-on, priced per copy.
   */
  envelopeAddOn: boolean;
  setEnvelopeAddOn: (value: boolean) => void;
  /** Both renditions can end up in the same order. */
  alsoInCart: boolean;
  setAlsoInCart: (value: boolean) => void;
  orderTotal: () => number;
  setReveal: (patch: Partial<EditorState["digital"]["reveal"]>) => void;
  setCover: (patch: Partial<EditorState["digital"]["cover"]>) => void;
  toggleRevealStep: (id: string) => void;
  /**
   * Sections of the guided steps that have been opened. Personalize and Finish
   * are walked front to back, so the rail needs to show what has been passed
   * and what is still ahead.
   */
  visited: ToolId[];
  /** Move to a section, crossing into another step if that is where it is. */
  goTo: (step: Step, tool: ToolId | null) => void;

  /** Flyout stays mounted but collapses when the rail is pinned closed. */
  railPinned: boolean;
  zoom: number;
  credits: number;
  agentOpen: boolean;
  agentDocked: boolean;
  past: CardDoc[];
  future: CardDoc[];

  setFace: (face: FaceId) => void;
  setTool: (tool: ToolId | null) => void;
  toggleTool: (tool: ToolId) => void;
  setRailPinned: (pinned: boolean) => void;
  setZoom: (zoom: number) => void;
  nudgeZoom: (delta: number) => void;
  /** True once the user drives the zoom themselves; stops auto-fitting. */
  zoomTouched: boolean;
  /** Keep the card fitted as chrome opens and faces change. */
  maybeFit: () => void;
  /** Viewport of the canvas host, kept in the store so the top bar can fit. */
  viewport: { width: number; height: number };
  setViewport: (viewport: { width: number; height: number }) => void;
  fitZoom: () => void;

  updateNode: (id: string, patch: Partial<EditorNode>, commit?: boolean) => void;
  updateFace: (
    face: FaceId,
    patch: Partial<Pick<CardDoc["faces"][FaceId], "background" | "backgroundAccent">>,
  ) => void;
  removeNode: (id: string) => void;
  addNode: (node: EditorNode, face?: FaceId) => void;

  /** One art style at a time — the library names are the real catalogue. */
  selectedStyles: string[];
  setStyle: (id: string) => void;

  envelope: Envelope;
  updateEnvelope: (patch: Partial<Envelope>) => void;

  /**
   * Marking up the card: box a region (annotate) or trace one freehand (wand),
   * then tell the agent what to change inside it.
   */
  canvasMode: CanvasMode;
  setCanvasMode: (mode: CanvasMode) => void;
  draftAnnotation: AnnotationRect | null;
  setDraftAnnotation: (rect: AnnotationRect | null) => void;
  /** Freehand path being traced, in card coordinates. */
  draftLasso: number[] | null;
  setDraftLasso: (points: number[] | null) => void;
  /** Segment under the pointer in Element mode. */
  hoverSegment: string | null;
  /** Name of the picked segment, if the region came from Element mode. */
  draftSegmentLabel: string | null;
  setHoverSegment: (id: string | null) => void;
  /** Clicking a segment opens the same prompt drawing a region does. */
  selectSegment: (segment: Segment) => void;
  annotationRequests: AnnotationRequest[];
  submitAnnotation: (instruction: string) => void;
  resolveAnnotation: (id: string) => void;

  /**
   * One brush, two tools. The highlighter paints the area it wants changed and
   * the eraser paints the area it wants gone — the mask is what the brush
   * covered, which is easier to aim than tracing an outline around it.
   */
  brushStrokes: number[][];
  setBrushStrokes: (strokes: number[][]) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  clearBrush: () => void;
  submitErase: () => void;

  /** Translations: pick a target language, agent re-renders every face. */
  targetLanguage: string | null;
  setTargetLanguage: (id: string | null) => void;
  translationStatus: "idle" | "translating" | "done";
  requestTranslation: () => void;

  /** Long-form text: what to write, how long, and where it lands on the card. */
  longForm: {
    /** Where the words come from: the agent writes them, or the user brings them. */
    source: "write" | "upload";
    kind: string | null;
    brief: string;
    length: LongFormLength;
    /** Text lifted off a photo or a document, editable before it's placed. */
    uploadedText: string;
    fileName: string | null;
    face: FaceId;
    rect: AnnotationRect;
    status: "idle" | "writing" | "placed";
  };
  setLongForm: (patch: Partial<EditorState["longForm"]>) => void;
  resetLongFormPlacement: () => void;
  requestLongForm: () => void;

  commit: () => void;
  undo: () => void;
  redo: () => void;

  setAgentOpen: (open: boolean) => void;
  setAgentDocked: (docked: boolean) => void;
};

function cloneDoc(doc: CardDoc): CardDoc {
  return structuredClone(doc);
}

/** Records a section as passed. Opening it is the visit; nothing is required. */
function visit(visited: ToolId[], tool: ToolId | null): ToolId[] {
  if (!tool || visited.includes(tool)) return visited;
  return [...visited, tool];
}

/**
 * The detail list always ends in one blank row, unless the invitation is
 * already carrying as much as it can print — which is what makes it grow as
 * you fill it instead of needing an Add button.
 *
 * Typed rows sort into catalogue order, so a field put back after being
 * removed returns to its place rather than the bottom of the invitation.
 */
function withBlankRow(rows: DetailRow[]): DetailRow[] {
  const typed = sortRows(rows.filter((r) => r.type));
  if (printedRows(typed).length >= MAX_PRINTED) return typed;
  return [...typed, blankRow()];
}

function blankRow(): DetailRow {
  return { id: uid("detail"), type: "", value: "", onInvitation: true };
}

/** The invitation the editor opens on, as rows. */
function seedDetails(): DetailRow[] {
  const values: Record<string, string> = {
    eventName: "The Funeral for My Youth",
    tagline: "Join us for the After Party",
    hostNames: "Anuj Patel",
    eventDate: "Saturday, November 13th, 2027",
    eventTime: "9:00 PM",
    venueName: "The Underground Bar",
    venueAddress: "Brooklyn, NY",
    dressCode: "Black tie",
  };
  const rows = SEED_TYPES.map((type) => ({
    id: uid("detail"),
    type,
    value: values[type] ?? "",
    onInvitation: DETAIL_TYPES.find((t) => t.type === type)?.onInvitation ?? true,
  }));
  return withBlankRow(rows);
}

/**
 * Kept outside the store: parking the other product's document is bookkeeping,
 * not state anything renders from.
 */
const stash: Record<Product, Stash | null> = { card: null, invitation: null };

/** A product's work, parked while the other line is open. */
type Stash = {
  doc: CardDoc;
  face: FaceId;
  past: CardDoc[];
  future: CardDoc[];
  visited: ToolId[];
};

export const useEditorStore = create<EditorState>((set, get) => ({
  doc: cloneDoc(sampleCard),
  face: "front",
  activeTool: null,

  product: "card",
  setProduct: (product) => {
    const state = get();
    if (product === state.product) return;

    const parked: Stash = {
      doc: state.doc,
      face: state.face,
      past: state.past,
      future: state.future,
      visited: state.visited,
    };
    const resumed =
      stash[product] ??
      ({
        doc:
          product === "invitation"
            ? invitationDoc(state.invitation.orientation)
            : cloneDoc(sampleCard),
        face: "front",
        past: [],
        future: [],
        visited: [],
      } satisfies Stash);
    stash[state.product] = parked;
    stash[product] = null;

    // The rail differs per product, so a panel the other line does not have
    // has to give way to whatever this step opens on.
    const tool = state.activeTool;
    const keeps =
      tool !== null && stepTools(state.step, state.cardType, product).includes(tool);

    set({
      product,
      doc: resumed.doc,
      face: resumed.face,
      past: resumed.past,
      future: resumed.future,
      visited: visit(resumed.visited, keeps ? tool : STEP_DEFAULT_TOOL[state.step]),
      activeTool: keeps ? tool : STEP_DEFAULT_TOOL[state.step],
      surface: "card",
      canvasMode: "element",
      draftAnnotation: null,
      draftLasso: null,
      brushStrokes: [],
      zoomTouched: false,
    });
    get().maybeFit();
  },

  invitation: {
    orientation: "portrait",
    details: seedDetails(),
    schedule: [],
    rsvpOn: true,
    rsvpMethod: "url",
    rsvpValue: "hstmp.co/funeral-youth",
    rsvpDeadline: "November 1st, 2027",
    rsvpLine: "RSVP before I get old",
    qrOn: true,
    qrShape: "rounded",
    qr: { ...DEFAULT_QR },
    stale: false,
    rendering: false,
  },

  setInvitation: (patch) =>
    set((s) => {
      // Every printed field is a row now, so the only things left here that
      // reach the artwork are the RSVP lines — and only while responses are
      // being collected at all.
      const touchesArt =
        ("rsvpLine" in patch || "rsvpDeadline" in patch || "rsvpOn" in patch) &&
        (patch.rsvpOn ?? s.invitation.rsvpOn);
      return {
        invitation: {
          ...s.invitation,
          ...patch,
          stale: s.invitation.stale || touchesArt,
        },
      };
    }),

  setOrientation: (orientation) =>
    set((s) => {
      if (orientation === s.invitation.orientation) return {};
      return {
        // Orientation is a property of the product, not a view of it: the trim
        // changes, so the document is rebuilt around the new one.
        doc:
          s.product === "invitation"
            ? cloneDoc(invitationDoc(orientation))
            : s.doc,
        invitation: { ...s.invitation, orientation, stale: true },
        zoomTouched: false,
      };
    }),

  // Choosing a type is what turns the trailing blank row into a real one, so
  // this is also where the next blank row comes from.
  setDetailType: (id, type) =>
    set((s) => {
      const definition = findDetailType(type);
      const details = s.invitation.details.map((d) =>
        d.id === id
          ? {
              id: d.id,
              type,
              value: "",
              customLabel: undefined,
              // Each type knows whether it usually belongs in print.
              onInvitation: definition?.onInvitation ?? true,
            }
          : d,
      );
      return {
        invitation: { ...s.invitation, details: withBlankRow(details) },
      };
    }),

  updateDetail: (id, patch) =>
    set((s) => {
      const before = s.invitation.details.find((d) => d.id === id);
      const details = s.invitation.details.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      );
      // Editing a hidden row is bookkeeping; showing or hiding one, or editing
      // a shown one, changes what gets printed.
      const touchesArt =
        !!before &&
        (before.onInvitation ||
          ("onInvitation" in patch && patch.onInvitation !== before.onInvitation));
      return {
        invitation: {
          ...s.invitation,
          details: withBlankRow(details),
          stale: s.invitation.stale || touchesArt,
        },
      };
    }),

  removeDetail: (id) =>
    set((s) => {
      const gone = s.invitation.details.find((d) => d.id === id);
      return {
        invitation: {
          ...s.invitation,
          details: withBlankRow(
            s.invitation.details.filter((d) => d.id !== id),
          ),
          stale:
            s.invitation.stale || (!!gone?.onInvitation && !!gone.value.trim()),
        },
      };
    }),

  setSchedule: (schedule) =>
    set((s) => {
      const shown = s.invitation.details.some(
        (d) => d.type === "eventSchedule" && d.onInvitation,
      );
      return {
        invitation: {
          ...s.invitation,
          schedule,
          stale: s.invitation.stale || shown,
        },
      };
    }),

  // The code is composited onto the finished artwork by the editor, so moving
  // or resizing it never asks the model for anything.
  moveQr: (pos, width) =>
    set((s) => {
      const w = width ?? s.invitation.qr.width;
      return { invitation: { ...s.invitation, qr: { ...clampQr(pos, w), width: w } } };
    }),

  renderInvitation: () => {
    if (get().invitation.rendering) return;
    set((s) => ({ invitation: { ...s.invitation, rendering: true } }));
    // Stub: the real agent re-renders the back panel from invitationDetails.
    window.setTimeout(() => {
      set((s) => ({
        invitation: { ...s.invitation, rendering: false, stale: false },
      }));
      // The change is on the back, so that is what there is to look at.
      if (get().product === "invitation") get().setFace("back");
    }, 1800);
  },

  step: 1,
  setStep: (step) => {
    // Panels belong to a step. Keep whatever is open if it lives in the step
    // being opened; otherwise lead with that step's first decision.
    const tool = get().activeTool;
    const keeps =
      tool !== null &&
      stepTools(step, get().cardType, get().product).includes(tool);
    const opened = keeps ? tool : STEP_DEFAULT_TOOL[step];
    set({
      step,
      activeTool: opened,
      visited: visit(get().visited, opened),
      agentOpen: step !== 3,
      canvasMode: "element",
      draftAnnotation: null,
      draftLasso: null,
      brushStrokes: [],
    });
  },
  cardType: "printed",
  setCardType: (cardType) => {
    // The rail forks here, so a panel that only exists on the other rendition
    // has to close rather than linger.
    const { step, activeTool } = get();
    const keeps =
      activeTool !== null &&
      stepTools(step, cardType, get().product).includes(activeTool);
    set({
      cardType,
      activeTool: keeps ? activeTool : "cardtype",
      // The rendition decides which sections exist, so a switch changes what
      // is still ahead — but what has been passed stays passed.
      visited: visit(get().visited, keeps ? activeTool : "cardtype"),
      surface: "card",
    });
  },

  surface: "card",
  setSurface: (surface) => set({ surface }),

  digital: {
    scene: {
      kind: "Gradient",
      styleId: "aurora",
      paletteId: "northern-lights",
      speed: 12,
    },
    backgroundTab: "All",
    envelopeLook: "m1",
    envelopeColour: "#f5bdc2",
    envelopeDecorPart: "liner",
    envelopeLiner: "baby",
    envelopeStamp: "classic",
    envelopeSeal: "wax-red",
    reveal: {
      preset: "rise",
      sequence: REVEAL_STEPS.map((s) => s.id),
      skipped: [],
      music: false,
      reducedMotion: true,
    },
    cover: {
      on: true,
      showSender: true,
      showAvatar: true,
      layout: "centred",
    },
  },
  setDigital: (patch) => set((s) => ({ digital: { ...s.digital, ...patch } })),

  fulfilment: {
    digitalDelivery: "link",
    printedDelivery: "mail",
    recipients: [
      {
        id: "r1",
        name: "Trish Sparks",
        email: "trish@sparks.co",
        line1: "129 E. Fremont Dr.",
        line2: "Las Vegas, NV 89101",
      },
    ],
    quantity: 1,
  },
  setFulfilment: (patch) =>
    set((s) => ({ fulfilment: { ...s.fulfilment, ...patch } })),
  addRecipient: () =>
    set((s) => ({
      fulfilment: {
        ...s.fulfilment,
        recipients: [
          ...s.fulfilment.recipients,
          { id: uid("rcp"), name: "", email: "", line1: "", line2: "" },
        ],
      },
    })),
  updateRecipient: (id, patch) =>
    set((s) => ({
      fulfilment: {
        ...s.fulfilment,
        recipients: s.fulfilment.recipients.map((r) =>
          r.id === id ? { ...r, ...patch } : r,
        ),
      },
    })),
  removeRecipient: (id) =>
    set((s) => ({
      fulfilment: {
        ...s.fulfilment,
        // Never leave the list empty — there is always someone to send to.
        recipients:
          s.fulfilment.recipients.length > 1
            ? s.fulfilment.recipients.filter((r) => r.id !== id)
            : s.fulfilment.recipients,
      },
    })),
  alsoInCart: false,
  setAlsoInCart: (alsoInCart) => set({ alsoInCart }),
  envelopeAddOn: true,
  setEnvelopeAddOn: (envelopeAddOn) => set({ envelopeAddOn }),

  // Digital is priced per recipient because each one gets their own link;
  // print is priced per copy, and invitations earn a quantity break because
  // they are bought by the guest list rather than one at a time.
  orderTotal: () => {
    const { cardType, fulfilment, alsoInCart, product, envelopeAddOn } = get();
    const { quantity, recipients } = fulfilment;
    const digitalSum = priceOf("digital", product).unit * recipients.length;
    const printedSum =
      unitPrice(product, "printed", quantity) * quantity +
      (product === "invitation" && envelopeAddOn
        ? ENVELOPE_ADD_ON * quantity
        : 0);
    const primary = cardType === "digital" ? digitalSum : printedSum;
    const extra = alsoInCart
      ? cardType === "digital"
        ? printedSum
        : digitalSum
      : 0;
    return primary + extra;
  },
  setReveal: (patch) =>
    set((s) => ({
      digital: { ...s.digital, reveal: { ...s.digital.reveal, ...patch } },
    })),
  setCover: (patch) =>
    set((s) => ({
      digital: { ...s.digital, cover: { ...s.digital.cover, ...patch } },
    })),
  toggleRevealStep: (id) =>
    set((s) => {
      const skipped = s.digital.reveal.skipped.includes(id)
        ? s.digital.reveal.skipped.filter((x) => x !== id)
        : [...s.digital.reveal.skipped, id];
      return { digital: { ...s.digital, reveal: { ...s.digital.reveal, skipped } } };
    }),
  railPinned: false,
  zoom: 0.46,
  credits: 10535,
  agentOpen: true,
  agentDocked: true,
  past: [],
  future: [],

  setFace: (face) => {
    set({ face, draftAnnotation: null, draftLasso: null, hoverSegment: null });
    get().maybeFit();
  },
  visited: [],
  goTo: (step, tool) =>
    set((s) => ({
      step,
      activeTool: tool,
      visited: visit(s.visited, tool),
      surface: "card",
      canvasMode: "element",
      draftAnnotation: null,
      draftLasso: null,
      brushStrokes: [],
    })),

  setTool: (activeTool) =>
    set((s) => ({ activeTool, visited: visit(s.visited, activeTool) })),
  toggleTool: (tool) =>
    set((s) => {
      const activeTool = s.activeTool === tool ? null : tool;
      return { activeTool, visited: visit(s.visited, activeTool) };
    }),
  setRailPinned: (railPinned) => set({ railPinned }),

  setZoom: (zoom) => set({ zoom: clamp(zoom, 0.1, 4), zoomTouched: true }),
  nudgeZoom: (delta) =>
    set((s) => ({ zoom: clamp(s.zoom + delta, 0.1, 4), zoomTouched: true })),
  zoomTouched: false,

  // Called whenever the canvas viewport or the face changes. Until the user
  // takes the zoom into their own hands we keep the card fitted; after that we
  // only step in when it would otherwise run off the canvas.
  maybeFit: () => {
    const { zoomTouched, zoom, viewport, doc, face } = get();
    if (!viewport.width || !viewport.height) return;
    if (!zoomTouched) {
      get().fitZoom();
      return;
    }
    const panel = doc.faces[face];
    const fits =
      panel.width * zoom <= viewport.width - CANVAS_PADDING_X &&
      panel.height * zoom <= viewport.height - CANVAS_PADDING_Y;
    if (!fits) get().fitZoom();
  },
  viewport: { width: 0, height: 0 },
  setViewport: (viewport) => {
    set({ viewport });
    get().maybeFit();
  },
  fitZoom: () => {
    const { viewport, doc, face } = get();
    if (!viewport.width || !viewport.height) return;
    const panel = doc.faces[face];
    const scale = Math.min(
      (viewport.width - CANVAS_PADDING_X) / panel.width,
      (viewport.height - CANVAS_PADDING_Y) / panel.height,
    );
    set({ zoom: clamp(scale, 0.1, 4), zoomTouched: false });
  },

  // Panels edit nodes that may live on a face other than the visible one (the
  // Message panel can be open while Front is showing), so look across all three.
  updateNode: (id, patch, commit = false) => {
    const state = get();
    const past = commit
      ? [...state.past, cloneDoc(state.doc)].slice(-MAX_HISTORY)
      : state.past;
    const doc = cloneDoc(state.doc);
    for (const faceId of Object.keys(doc.faces) as FaceId[]) {
      doc.faces[faceId].nodes = doc.faces[faceId].nodes.map((n) =>
        n.id === id ? ({ ...n, ...patch } as EditorNode) : n,
      );
    }
    set({ doc, past, future: commit ? [] : state.future });
  },

  updateFace: (faceId, patch) => {
    const state = get();
    const doc = cloneDoc(state.doc);
    doc.faces[faceId] = { ...doc.faces[faceId], ...patch };
    set({
      doc,
      past: [...state.past, cloneDoc(state.doc)].slice(-MAX_HISTORY),
      future: [],
    });
  },

  removeNode: (id) => {
    const state = get();
    const doc = cloneDoc(state.doc);
    const face = doc.faces[state.face];
    face.nodes = face.nodes.filter((n) => n.id !== id);
    set({
      doc,
      past: [...state.past, cloneDoc(state.doc)].slice(-MAX_HISTORY),
      future: [],
    });
  },

  addNode: (node, face) => {
    const state = get();
    const doc = cloneDoc(state.doc);
    doc.faces[face ?? state.face].nodes.push(node);
    set({
      doc,
      past: [...state.past, cloneDoc(state.doc)].slice(-MAX_HISTORY),
      future: [],
    });
  },

  selectedStyles: ["ethereal-glitter-portrait"],
  setStyle: (id) => set({ selectedStyles: [id] }),

  envelope: defaultEnvelope,
  updateEnvelope: (patch) =>
    set((s) => ({ envelope: { ...s.envelope, ...patch } })),

  canvasMode: "element",
  // Switching mode clears any half-drawn region, and drops the selection so
  // transformer handles aren't sitting on top of the area you're marking.
  setCanvasMode: (canvasMode) =>
    set({
      canvasMode,
      draftAnnotation: null,
      draftLasso: null,
      draftSegmentLabel: null,
      brushStrokes: [],
      hoverSegment: null,
    }),

  draftAnnotation: null,
  setDraftAnnotation: (draftAnnotation) =>
    set({ draftAnnotation, draftSegmentLabel: null }),
  draftLasso: null,
  setDraftLasso: (draftLasso) => set({ draftLasso }),
  hoverSegment: null,
  draftSegmentLabel: null,
  setHoverSegment: (hoverSegment) => set({ hoverSegment }),
  selectSegment: (segment) =>
    set({
      draftAnnotation: boundsOf(segment.points),
      draftLasso: segment.points,
      draftSegmentLabel: segment.label,
      hoverSegment: null,
    }),

  annotationRequests: [],
  submitAnnotation: (instruction) => {
    const {
      canvasMode,
      draftAnnotation,
      draftLasso,
      draftSegmentLabel,
      brushStrokes,
      brushSize,
      face,
    } = get();
    // A highlighted region is defined by paint; a boxed or picked one by a
    // rectangle or an outline. Either way the agent gets one region and one
    // instruction.
    const painted = canvasMode === "highlighter" && brushStrokes.length > 0;
    const rect = painted
      ? paintedBounds(brushStrokes, brushSize)
      : draftAnnotation;
    if (!rect || !instruction.trim()) return;

    const request: AnnotationRequest = {
      id: uid("ann"),
      face,
      rect,
      points: painted ? undefined : (draftLasso ?? undefined),
      strokes: painted ? brushStrokes : undefined,
      brushSize: painted ? brushSize : undefined,
      segmentLabel: draftSegmentLabel ?? undefined,
      instruction: instruction.trim(),
      kind: "edit",
      status: "rendering",
    };

    set((s) => ({
      annotationRequests: [...s.annotationRequests, request],
      draftAnnotation: null,
      draftLasso: null,
      draftSegmentLabel: null,
      brushStrokes: [],
      canvasMode: "element",
      agentOpen: true,
    }));

    // Stubbed round-trip. The real thing hands the region and the instruction
    // to the agent and swaps in a fresh render of that area.
    setTimeout(() => get().resolveAnnotation(request.id), 2400);
  },

  brushStrokes: [],
  setBrushStrokes: (brushStrokes) => set({ brushStrokes }),
  brushSize: 90,
  setBrushSize: (brushSize) => set({ brushSize: clamp(brushSize, 20, 260) }),
  clearBrush: () => set({ brushStrokes: [] }),

  submitErase: () => {
    const { brushStrokes, brushSize, face } = get();
    if (brushStrokes.length === 0) return;

    const request: AnnotationRequest = {
      id: uid("erase"),
      face,
      rect: paintedBounds(brushStrokes, brushSize),
      strokes: brushStrokes,
      brushSize,
      instruction: "",
      kind: "erase",
      status: "rendering",
    };

    set((s) => ({
      annotationRequests: [...s.annotationRequests, request],
      brushStrokes: [],
      canvasMode: "element",
      agentOpen: true,
    }));

    // Stub — the real thing inpaints the area from the surrounding artwork.
    setTimeout(() => get().resolveAnnotation(request.id), 2400);
  },

  resolveAnnotation: (id) =>
    set((s) => ({
      annotationRequests: s.annotationRequests.map((r) =>
        r.id === id ? { ...r, status: "done" } : r,
      ),
    })),

  targetLanguage: null,
  setTargetLanguage: (targetLanguage) =>
    set({ targetLanguage, translationStatus: "idle" }),
  translationStatus: "idle",
  requestTranslation: () => {
    if (!get().targetLanguage) return;
    set({ translationStatus: "translating" });
    // Stub — the agent would re-render all three faces with translated type.
    setTimeout(() => set({ translationStatus: "done" }), 2400);
  },

  longForm: {
    source: "write",
    kind: null,
    brief: "",
    length: "medium",
    uploadedText: "",
    fileName: null,
    face: "inside",
    rect: defaultLongFormRect(),
    status: "idle",
  },
  setLongForm: (patch) =>
    set((s) => ({ longForm: { ...s.longForm, ...patch } })),
  resetLongFormPlacement: () =>
    set((s) => ({ longForm: { ...s.longForm, rect: defaultLongFormRect() } })),

  requestLongForm: () => {
    const { longForm } = get();
    const uploading = longForm.source === "upload";
    const option = findLongForm(longForm.kind);
    const body = uploading ? longForm.uploadedText.trim() : null;
    if (uploading ? !body : !option) return;

    set({ longForm: { ...longForm, status: "writing" } });

    // Stub — the agent would write this. We drop in sample copy of the right
    // shape so the block can be seen flowing into the placement rect.
    setTimeout(() => {
      const state = get();
      const rect = state.longForm.rect;
      const node: EditorNode = {
        id: LONG_FORM_NODE_ID,
        kind: "text",
        name: uploading ? "Uploaded text" : option!.label,
        text: body ?? sampleFor(option!.shape),
        x: rect.x,
        y: rect.y,
        width: rect.width,
        fontSize: 34,
        fontFamily: "DM Sans",
        fontStyle: "normal",
        fill: "#f7f0dd",
        align: "left",
        lineHeight: 1.5,
        letterSpacing: 0,
        rotation: 0,
        opacity: 1,
      };

      const doc = cloneDoc(state.doc);
      const face = doc.faces[state.longForm.face];
      face.nodes = face.nodes.filter((n) => n.id !== LONG_FORM_NODE_ID);
      face.nodes.push(node);

      set({
        doc,
        past: [...state.past, cloneDoc(state.doc)].slice(-MAX_HISTORY),
        future: [],
        longForm: { ...state.longForm, status: "placed" },
      });
    }, uploading ? 400 : 2400);
  },

  commit: () =>
    set((s) => ({
      past: [...s.past, cloneDoc(s.doc)].slice(-MAX_HISTORY),
      future: [],
    })),

  undo: () => {
    const { past, doc, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      doc: previous,
      past: past.slice(0, -1),
      future: [cloneDoc(doc), ...future].slice(0, MAX_HISTORY),
    });
  },

  redo: () => {
    const { future, doc, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      doc: next,
      future: future.slice(1),
      past: [...past, cloneDoc(doc)].slice(-MAX_HISTORY),
    });
  },

  setAgentOpen: (agentOpen) => set({ agentOpen }),
  setAgentDocked: (agentDocked) => set({ agentDocked }),
}));

export const useActiveFace = () =>
  useEditorStore((s) => s.doc.faces[s.face]);

/** Find a node by id on any face — panels address nodes globally. */
export const useNode = <T extends EditorNode>(id: string) =>
  useEditorStore((s) => {
    for (const face of Object.values(s.doc.faces)) {
      const found = face.nodes.find((n) => n.id === id);
      if (found) return found as T;
    }
    return null;
  });


