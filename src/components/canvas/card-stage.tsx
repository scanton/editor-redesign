"use client";

import type Konva from "konva";
import { Ellipse, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { useFontFamilies } from "@/components/canvas/use-font-families";
import { cardTransform } from "@/lib/card-transform";
import type { EditorNode } from "@/lib/types";
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
  return (
    <Group {...common}>
      <Text
        text={node.label ?? node.name}
        width={node.width}
        y={node.height / 2 - 20}
        align="center"
        fontSize={34}
        fontFamily={resolveFont("DM Sans")}
        fill="rgba(255,255,255,0.85)"
      />
    </Group>
  );
}
