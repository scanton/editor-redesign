"use client";

import type Konva from "konva";
import {
  Ellipse,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from "react-konva";
import useImage from "use-image";
import { useFontFamilies } from "@/components/canvas/use-font-families";
import { cardTransform } from "@/lib/card-transform";
import { QR_IMAGE, QR_SHAPES } from "@/lib/invitation";
import type { EditorNode, ImageNode } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";

type Props = { width: number; height: number };

/**
 * Draws the card, and nothing else. A finished card is a flat render, so there
 * is nothing here to click: the Element tool picks segments in the DOM layer
 * above, and placement is handled by the panel that owns the piece.
 */
export default function CardStage({ width, height }: Props) {
  const zoom = useEditorStore((s) => s.zoom);
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const nudgeZoom = useEditorStore((s) => s.nudgeZoom);

  const resolveFont = useFontFamilies();
  const transform = cardTransform({ width, height }, face, zoom);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey && !e.evt.metaKey) return;
    e.evt.preventDefault();
    nudgeZoom(-e.evt.deltaY * 0.002);
  };

  return (
    // Stage keeps listening so ⌘-wheel zoom works; the layer does not, so
    // nothing on the card is clickable.
    <Stage width={width} height={height} onWheel={handleWheel}>
      <Layer listening={false}>
        <Group
          x={transform.x}
          y={transform.y}
          scaleX={transform.scale}
          scaleY={transform.scale}
        >
          {/* Card body — soft drop shadow reads as paper on the dot grid. */}
          <Rect
            width={face.width}
            height={face.height}
            cornerRadius={8}
            fill={face.backgroundAccent ? undefined : face.background}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: face.height }}
            fillLinearGradientColorStops={
              face.backgroundAccent
                ? [0, face.background, 1, face.backgroundAccent]
                : undefined
            }
            shadowColor="#16161a"
            shadowBlur={60 / zoom}
            shadowOpacity={0.28}
            shadowOffsetY={24}
            listening={false}
          />

          {face.nodes.map((node) => (
            <NodeView key={node.id} node={node} resolveFont={resolveFont} />
          ))}

          {/* Composited onto the finished artwork rather than rendered into
              it, which is why moving it never costs a re-render. */}
          <QrNode face={face} />
        </Group>
      </Layer>
    </Stage>
  );
}

function NodeView({
  node,
  resolveFont,
}: {
  node: EditorNode;
  resolveFont: (family: string) => string;
}) {
  const common = {
    id: node.id,
    x: node.x,
    y: node.y,
    rotation: node.rotation,
    opacity: node.opacity,
  };

  if (node.kind === "text") {
    return (
      <Text
        {...common}
        text={node.text}
        width={node.width}
        fontSize={node.fontSize}
        fontFamily={resolveFont(node.fontFamily)}
        fontStyle={node.fontStyle}
        fill={node.fill}
        align={node.align}
        lineHeight={node.lineHeight}
        letterSpacing={node.letterSpacing}
        stroke={node.stroke}
        strokeWidth={node.strokeWidth ?? 0}
        fillAfterStrokeEnabled
      />
    );
  }

  if (node.kind === "draw") {
    const scale = node.width / node.sourceWidth;
    return (
      <Group {...common} scaleX={scale} scaleY={scale}>
        {/* Keeps an empty signature grabbable instead of invisible. */}
        <Rect
          width={node.sourceWidth}
          height={node.sourceHeight}
          fill="rgba(0,0,0,0.001)"
        />
        {node.strokes.map((stroke, i) => (
          <Line
            key={i}
            points={stroke.points}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            lineCap="round"
            lineJoin="round"
            tension={0.3}
            listening={false}
          />
        ))}
        {node.typed?.text && (
          <Text
            text={node.typed.text}
            width={node.sourceWidth}
            y={node.sourceHeight * 0.28}
            fontSize={64}
            fontFamily={resolveFont(node.typed.fontFamily)}
            fill={node.typed.fill}
            listening={false}
          />
        )}
      </Group>
    );
  }

  if (node.kind === "shape") {
    const shapeProps = { ...common, fill: node.fill };

    return node.shape === "ellipse" ? (
      <Ellipse
        {...shapeProps}
        radiusX={node.width / 2}
        radiusY={node.height / 2}
      />
    ) : (
      <Rect
        {...shapeProps}
        width={node.width}
        height={node.height}
        cornerRadius={node.cornerRadius}
      />
    );
  }

  // The artwork is the flat render — it is the card, not something on it.
  return <ArtworkNode node={node} />;
}

/**
 * The finished artwork. Loading is async, so the card paints its flat colour
 * until the bitmap arrives rather than flashing an empty rectangle.
 *
 * "cover" centre-crops the bitmap into its frame instead of stretching it —
 * what lets one portrait render sit on a landscape trim without distorting.
 */
function ArtworkNode({ node }: { node: ImageNode }) {
  const [image] = useImage(node.src);
  if (!image) return null;

  const crop =
    node.fit === "cover"
      ? coverCrop(image.width, image.height, node.width, node.height)
      : undefined;

  return (
    <KonvaImage
      image={image}
      x={node.x}
      y={node.y}
      width={node.width}
      height={node.height}
      crop={crop}
      cornerRadius={node.cornerRadius}
      rotation={node.rotation}
      opacity={node.opacity}
    />
  );
}

/** The largest centred region of the source that matches the frame's shape. */
function coverCrop(
  sw: number,
  sh: number,
  fw: number,
  fh: number,
): { x: number; y: number; width: number; height: number } {
  const want = fw / fh;
  const have = sw / sh;
  if (have > want) {
    const width = sh * want;
    return { x: (sw - width) / 2, y: 0, width, height: sh };
  }
  const height = sw / want;
  return { x: 0, y: (sh - height) / 2, width: sw, height };
}

/**
 * The RSVP code on the back panel. Held as fractions of the trim so it keeps
 * its place through an orientation change, and drawn here so it is part of the
 * card wherever you are in the editor — the drag handles live in the DOM layer
 * above, and only while the Event panel is open.
 */
function QrNode({ face }: { face: { id: string; width: number; height: number } }) {
  const [image] = useImage(QR_IMAGE);
  const show = useEditorStore(
    (s) =>
      s.product === "invitation" &&
      s.invitation.qrOn &&
      s.invitation.rsvpOn &&
      face.id === "back",
  );
  const qr = useEditorStore((s) => s.invitation.qr);
  const shape = useEditorStore((s) => s.invitation.qrShape);

  if (!show || !image) return null;

  const size = qr.width * face.width;
  const pad = size * 0.06;
  const radius = QR_SHAPES.find((s) => s.value === shape)!.radius;
  const scale = size / 100;

  return (
    <Group x={qr.x * face.width - size / 2} y={qr.y * face.height - size / 2}>
      <Rect
        width={size}
        height={size}
        fill="#ffffff"
        cornerRadius={radius * scale}
        shadowColor="#000000"
        shadowBlur={18 * scale}
        shadowOpacity={0.45}
        shadowOffsetY={4 * scale}
      />
      <KonvaImage
        image={image}
        x={pad}
        y={pad}
        width={size - pad * 2}
        height={size - pad * 2}
        cornerRadius={Math.max(0, radius - 4) * scale}
      />
    </Group>
  );
}
