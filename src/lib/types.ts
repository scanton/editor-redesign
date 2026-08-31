export type FaceId = "front" | "inside" | "back";

export type ToolId =
  | "styles"
  | "message"
  | "signature"
  | "translations"
  | "longform"
  | "cardtype"
  | "envelope"
  | "review";

export type Step = 1 | 2 | 3;

/** A card exists as both renditions at once; this is the one being edited. */
export type CardType = "digital" | "printed";

export type BaseNode = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  name: string;
};

export type TextNode = BaseNode & {
  kind: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "bold" | "italic" | "italic bold";
  fill: string;
  align: "left" | "center" | "right";
  width: number;
  lineHeight: number;
  letterSpacing: number;
  stroke?: string;
  strokeWidth?: number;
};

export type ImageNode = BaseNode & {
  kind: "image";
  src: string;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  /** Placeholder label shown when we're not rendering a real asset. */
  label?: string;
};

export type ShapeNode = BaseNode & {
  kind: "shape";
  shape: "rect" | "ellipse";
  width: number;
  height: number;
  fill: string;
  cornerRadius: number;
};

export type Stroke = {
  /** Flat [x0, y0, x1, y1, …] in the capture pad's own coordinate space. */
  points: number[];
  width: number;
  color: string;
};

/**
 * A signature. Either drawn (strokes) or typed in a script face — the Signature
 * panel's Draw and Type tabs write to the same node.
 */
export type DrawNode = BaseNode & {
  kind: "draw";
  strokes: Stroke[];
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
  typed?: { text: string; fontFamily: string; fill: string };
};

export type EditorNode = TextNode | ImageNode | ShapeNode | DrawNode;

export type Address = {
  name: string;
  line1: string;
  line2: string;
};

/** A region of a face, in card coordinates. */
export type AnnotationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** What the pointer does on the canvas. */
export type CanvasMode = "element" | "annotate" | "wand" | "eraser";

/**
 * A region the user marked out, plus what they want changed there. Boxed
 * regions carry only a rect; freehand ones also carry the traced path, with
 * `rect` as its bounding box.
 */
export type AnnotationRequest = {
  id: string;
  face: FaceId;
  /** Bounding box of whatever was marked — drives labels and prompt placement. */
  rect: AnnotationRect;
  /** Flat [x0, y0, …] in card coordinates. Present for freehand regions. */
  points?: number[];
  /** Set when the region came from clicking a segment rather than drawing one. */
  segmentLabel?: string;
  /** Brush strokes, one flat point list each. Present for erase requests. */
  strokes?: number[][];
  brushSize?: number;
  /** Empty for an erase — removing something needs no instruction. */
  instruction: string;
  kind: "edit" | "erase";
  status: "rendering" | "done";
};

export type Envelope = {
  flap: "euro" | "square";
  font: string;
  sender: Address;
  recipient: Address;
};

/**
 * A region the segmentation model found in the rendered artwork. Clicking one
 * hands its outline to the agent without the customer having to trace it.
 */
export type Segment = {
  id: string;
  label: string;
  /** Flat [x0, y0, …] outline in card coordinates. */
  points: number[];
};

export type Face = {
  id: FaceId;
  label: string;
  /**
   * Faces are not all the same shape: front and back are single 5×7 panels,
   * while inside is the full 10×7 spread across the fold, designed as one image.
   */
  width: number;
  height: number;
  background: string;
  /** Optional second color — renders as a soft vertical gradient. */
  backgroundAccent?: string;
  nodes: EditorNode[];
  /**
   * Ordered most-specific first: hit-testing takes the first match, so a figure
   * standing on a background is picked before the background it stands on.
   */
  segments?: Segment[];
};

export type CardDoc = {
  id: string;
  title: string;
  faces: Record<FaceId, Face>;
};
