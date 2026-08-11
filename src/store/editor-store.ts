"use client";

import { create } from "zustand";
import { defaultEnvelope, sampleCard } from "@/lib/sample-card";
import { SWITCHER_INSET, TOOLBAR_INSET } from "@/lib/card-transform";
import {
  defaultLongFormRect,
  findLongForm,
  sampleFor,
  type LongFormLength,
} from "@/lib/long-form";
import type {
  AnnotationRect,
  AnnotationRequest,
  CanvasMode,
  CardDoc,
  EditorNode,
  Envelope,
  FaceId,
  ToolId,
} from "@/lib/types";
import { boundsOf } from "@/lib/lasso";
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
  selectedId: string | null;
  activeTool: ToolId | null;
  /** Flyout stays mounted but collapses when the rail is pinned closed. */
  railPinned: boolean;
  zoom: number;
  credits: number;
  agentOpen: boolean;
  agentDocked: boolean;
  past: CardDoc[];
  future: CardDoc[];

  setFace: (face: FaceId) => void;
  select: (id: string | null) => void;
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

  /** Styles panel is multi-select — a card can read as "photo + bold". */
  selectedStyles: string[];
  toggleStyle: (id: string) => void;

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
  annotationRequests: AnnotationRequest[];
  submitAnnotation: (instruction: string) => void;
  resolveAnnotation: (id: string) => void;

  /** Magic eraser: paint over what should go, no instruction needed. */
  eraserStrokes: number[][];
  setEraserStrokes: (strokes: number[][]) => void;
  eraserSize: number;
  setEraserSize: (size: number) => void;
  clearEraser: () => void;
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

export const useEditorStore = create<EditorState>((set, get) => ({
  doc: cloneDoc(sampleCard),
  face: "front",
  selectedId: null,
  activeTool: null,
  railPinned: false,
  zoom: 0.46,
  credits: 10535,
  agentOpen: true,
  agentDocked: true,
  past: [],
  future: [],

  setFace: (face) => {
    set({ face, selectedId: null });
    get().maybeFit();
  },
  select: (selectedId) => set({ selectedId }),
  setTool: (activeTool) => set({ activeTool }),
  toggleTool: (tool) =>
    set((s) => ({ activeTool: s.activeTool === tool ? null : tool })),
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
      selectedId: state.selectedId === id ? null : state.selectedId,
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
      selectedId: node.id,
      past: [...state.past, cloneDoc(state.doc)].slice(-MAX_HISTORY),
      future: [],
    });
  },

  selectedStyles: ["bold"],
  toggleStyle: (id) =>
    set((s) => ({
      selectedStyles: s.selectedStyles.includes(id)
        ? s.selectedStyles.filter((x) => x !== id)
        : [...s.selectedStyles, id],
    })),

  envelope: defaultEnvelope,
  updateEnvelope: (patch) =>
    set((s) => ({ envelope: { ...s.envelope, ...patch } })),

  canvasMode: "select",
  // Switching mode clears any half-drawn region, and drops the selection so
  // transformer handles aren't sitting on top of the area you're marking.
  setCanvasMode: (canvasMode) =>
    set({
      canvasMode,
      draftAnnotation: null,
      draftLasso: null,
      eraserStrokes: [],
      selectedId: null,
    }),

  draftAnnotation: null,
  setDraftAnnotation: (draftAnnotation) => set({ draftAnnotation }),
  draftLasso: null,
  setDraftLasso: (draftLasso) => set({ draftLasso }),

  annotationRequests: [],
  submitAnnotation: (instruction) => {
    const { draftAnnotation, draftLasso, face } = get();
    if (!draftAnnotation || !instruction.trim()) return;

    const request: AnnotationRequest = {
      id: uid("ann"),
      face,
      rect: draftAnnotation,
      points: draftLasso ?? undefined,
      instruction: instruction.trim(),
      kind: "edit",
      status: "rendering",
    };

    set((s) => ({
      annotationRequests: [...s.annotationRequests, request],
      draftAnnotation: null,
      draftLasso: null,
      canvasMode: "select",
      agentOpen: true,
    }));

    // Stubbed round-trip. The real thing hands the region and the instruction
    // to the agent and swaps in a fresh render of that area.
    setTimeout(() => get().resolveAnnotation(request.id), 2400);
  },

  eraserStrokes: [],
  setEraserStrokes: (eraserStrokes) => set({ eraserStrokes }),
  eraserSize: 90,
  setEraserSize: (eraserSize) => set({ eraserSize: clamp(eraserSize, 20, 260) }),
  clearEraser: () => set({ eraserStrokes: [] }),

  submitErase: () => {
    const { eraserStrokes, eraserSize, face } = get();
    if (eraserStrokes.length === 0) return;

    // The painted area is the path plus half a brush on every side.
    const pad = eraserSize / 2;
    const bounds = boundsOf(eraserStrokes.flat());
    const request: AnnotationRequest = {
      id: uid("erase"),
      face,
      rect: {
        x: bounds.x - pad,
        y: bounds.y - pad,
        width: bounds.width + eraserSize,
        height: bounds.height + eraserSize,
      },
      strokes: eraserStrokes,
      brushSize: eraserSize,
      instruction: "",
      kind: "erase",
      status: "rendering",
    };

    set((s) => ({
      annotationRequests: [...s.annotationRequests, request],
      eraserStrokes: [],
      canvasMode: "select",
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
        fontFamily: "Inter",
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


