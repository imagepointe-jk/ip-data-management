import Konva from "konva";
import { ReactNode, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";
import { useEditor } from "../../EditorContext";
import { clamp } from "@/utility/misc";
import { calculateObjectPositionLimits } from "@/customizer/utils";

//? As of Aug. 2024 the official Konva docs say there is no official "React way" to use the Transformer.
//? This generalized component appears to work well enough for now.

export type TransformLimits = {
  size?: {
    min?: {
      width?: number;
      height?: number;
    };
    max?: {
      width?: number;
      height?: number;
    };
  };
  boundingRect?: {
    topLeft: {
      x: number;
      y: number;
    };
    bottomRight: {
      x: number;
      y: number;
    };
  };
};
type Props = {
  children: ReactNode;
  selected?: boolean;
  limits?: TransformLimits;
};
export function Transformable({ children, selected, limits }: Props) {
  const mainRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { setArtworkTransform, selectedEditorGuid } = useEditor();

  function onTransformEnd() {
    const transformer = transformerRef.current;
    const main = mainRef.current;
    const node = main?.children[0];
    if (!transformer || !node || !selectedEditorGuid) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const minWidth = limits?.size?.min?.width || 0;
    const maxWidth = limits?.size?.max?.width || Infinity;
    const minHeight = limits?.size?.min?.height || 0;
    const maxHeight = limits?.size?.max?.height || Infinity;

    const newWidth = clamp(node.width() * scaleX, minWidth, maxWidth);
    const newHeight = clamp(node.height() * scaleY, minHeight, maxHeight);

    const { min: minPosition, max: maxPosition } =
      calculateObjectPositionLimits({
        object: {
          width: newWidth,
          height: newHeight,
        },
        boundingRect: limits?.boundingRect,
      });

    const clampedX = clamp(node.x(), minPosition.x, maxPosition.x);
    const clampedY = clamp(node.y(), minPosition.y, maxPosition.y);

    node.x(clampedX);
    node.y(clampedY);

    setArtworkTransform(selectedEditorGuid, {
      xPx: clampedX,
      yPx: clampedY,
      widthPx: newWidth,
      heightPx: newHeight,
      rotationDegrees: node.rotation(),
    });
  }

  function onDragEnd() {
    const node = mainRef.current?.children[0];
    if (!node || !selectedEditorGuid) return;

    const { min, max } = calculateObjectPositionLimits({
      object: {
        width: node.width(),
        height: node.height(),
      },
      boundingRect: limits?.boundingRect,
    });

    const clampedX = clamp(node.x(), min.x, max.x);
    const clampedY = clamp(node.y(), min.y, max.y);

    node.x(clampedX);
    node.y(clampedY);

    setArtworkTransform(selectedEditorGuid, {
      xPx: clampedX,
      yPx: clampedY,
    });
  }

  useEffect(() => {
    if (!selected) return;

    const transformer = transformerRef.current;
    const main = mainRef.current;
    const node = main?.children[0];
    if (!transformer || !node) return;

    transformer.nodes([node]);
    transformer.getLayer()?.batchDraw();

    node.on("dragend", onDragEnd);
    node.draggable(true);

    return () => {
      node.off("dragend", onDragEnd);
    };
  }, [selected]);

  return (
    <>
      <Group ref={mainRef}>{children}</Group>
      {selected && (
        <Transformer ref={transformerRef} onTransformEnd={onTransformEnd} />
      )}
    </>
  );
}
