"use client";

import { useEffect, useRef } from "react";
import type Konva from "konva";
import {
  Ellipse,
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import { useFontFamilies } from "@/components/canvas/use-font-families";
import { cardTransform } from "@/lib/card-transform";
import type { EditorNode } from "@/lib/types";
import { useEditorStore } from "@/store/editor-store";

type Props = { width: number; height: number };

/**
 * Draws the card. The artwork itself is a flat render and isn't selectable —
 * but the pieces placed on top of it (message, closing, signature) are, so a
 * signature can be positioned by hand.
 */
export default function CardStage({ width, height }: Props) {
  const zoom = useEditorStore((s) => s.zoom);
  const faceId = useEditorStore((s) => s.face);
  const face = useEditorStore((s) => s.doc.faces[s.face]);
  const selectedId = useEditorStore((s) => s.selectedId);
  const select = useEditorStore((s) => s.select);
  const updateNode = useEditorStore((s) => s.updateNode);
  const nudgeZoom = useEditorStore((s) => s.nudgeZoom);
  // Marking up the card owns the pointer while it's active.
  const interactive = useEditorStore((s) => s.canvasMode === "select");

  const resolveFont = useFontFamilies();
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const transform = cardTransform({ width, height }, face, zoom);

  // Keep the transformer glued to whatever is selected on the current face.
  useEffect(() => {
    const tr = trRef.current;
    const layer = layerRef.current;
    if (!tr || !layer) return;

    const node = selectedId && interactive ? layer.findOne(`#${selectedId}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, faceId, face.nodes, interactive]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey && !e.evt.metaKey) return;
    e.evt.preventDefault();
    nudgeZoom(-e.evt.deltaY * 0.002);
  };

  const clearOnEmpty = (e: Konva.KonvaEventObject<Event>) => {
    if (e.target === e.target.getStage()) select(null);
  };

  return (
    <Stage
      width={width}
      height={height}
      onWheel={handleWheel}
      onMouseDown={clearOnEmpty}
      onTouchStart={clearOnEmpty}
    >
      <Layer ref={layerRef}>
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
            <NodeView
              key={node.id}
              node={node}
              interactive={interactive}
              resolveFont={resolveFont}
              onSelect={() => select(node.id)}
              onChange={(patch, commit) => updateNode(node.id, patch, commit)}
            />
          ))}
        </Group>

        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={false}
          borderStroke="#d5232b"
          borderStrokeWidth={2}
          anchorStroke="#d5232b"
          anchorFill="#ffffff"
          anchorCornerRadius={6}
          anchorSize={10}
          padding={6}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
          onTransformEnd={() => useEditorStore.getState().commit()}
        />
      </Layer>
    </Stage>
  );
}

function NodeView({
  node,
  interactive,
  resolveFont,
  onSelect,
  onChange,
}: {
  node: EditorNode;
  interactive: boolean;
  resolveFont: (family: string) => string;
  onSelect: () => void;
  onChange: (patch: Partial<EditorNode>, commit?: boolean) => void;
}) {
  const common = {
    id: node.id,
    x: node.x,
    y: node.y,
    rotation: node.rotation,
    opacity: node.opacity,
    draggable: interactive && !node.locked,
    onMouseDown: onSelect,
    onTouchStart: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
      onChange({ x: e.target.x(), y: e.target.y() }, true),
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
        onTransformEnd={(e) => {
          const target = e.target as Konva.Text;
          const scaleX = target.scaleX();
          target.scaleX(1);
          target.scaleY(1);
          onChange(
            {
              x: target.x(),
              y: target.y(),
              rotation: target.rotation(),
              width: Math.max(40, target.width() * scaleX),
            },
            true,
          );
        }}
      />
    );
  }

  if (node.kind === "draw") {
    const scale = node.width / node.sourceWidth;
    return (
      <Group
        {...common}
        scaleX={scale}
        scaleY={scale}
        onTransformEnd={(e) => {
          const target = e.target;
          const nextScale = target.scaleX();
          target.scaleX(scale);
          target.scaleY(scale);
          onChange(
            {
              x: target.x(),
              y: target.y(),
              rotation: target.rotation(),
              width: Math.max(60, node.width * (nextScale / scale)),
              height: Math.max(20, node.height * (nextScale / scale)),
            },
            true,
          );
        }}
      >
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
    const shapeProps = {
      ...common,
      fill: node.fill,
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
        const target = e.target;
        const scaleX = target.scaleX();
        const scaleY = target.scaleY();
        target.scaleX(1);
        target.scaleY(1);
        onChange(
          {
            x: target.x(),
            y: target.y(),
            rotation: target.rotation(),
            width: Math.max(20, node.width * scaleX),
            height: Math.max(20, node.height * scaleY),
          },
          true,
        );
      },
    };

    return node.shape === "ellipse" ? (
      <Ellipse {...shapeProps} radiusX={node.width / 2} radiusY={node.height / 2} />
    ) : (
      <Rect
        {...shapeProps}
        width={node.width}
        height={node.height}
        cornerRadius={node.cornerRadius}
      />
    );
  }

  // The artwork is the flat render — it's the card, not something on the card,
  // so it stays out of the way of selection entirely.
  return (
    <Group {...common} draggable={false} listening={false}>
      <Text
        text={node.label ?? node.name}
        width={node.width}
        y={node.height / 2 - 20}
        align="center"
        fontSize={34}
        fontFamily={resolveFont("Inter")}
        fill="rgba(255,255,255,0.85)"
      />
    </Group>
  );
}
