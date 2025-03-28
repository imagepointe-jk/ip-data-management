import Konva from "konva";
import { ReactNode, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { useDispatch } from "react-redux";
import { setObjectTransform } from "@/customizer/redux/slices/cart";
import { TransformArgsPx } from "@/types/schema/customizer";

//? As of Aug. 2024 the official Konva docs say there is no official "React way" to use the Transformer.
//? This generalized component appears to work well enough for now.

type Props = {
  children: ReactNode;
  selected?: boolean;
  constrainTransform?: (params: TransformArgsPx) => {
    constrainedPosition: { x: number; y: number };
    constrainedSize: { width: number; height: number };
  };
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onTransformStart?: () => void;
  onTransformEnd?: () => void;
};
export function Transformable({
  children,
  selected,
  onTransformStart,
  onTransformEnd: onTransformEndExtra,
  onDragStart,
  onDragEnd: onDragEndExtra,
  constrainTransform,
}: Props) {
  const mainRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const dispatch = useDispatch();

  function onTransformEnd() {
    const transformer = transformerRef.current;
    const main = mainRef.current;
    const node = main?.children[0];
    if (!transformer || !node || !selectedEditorGuid) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    node.scaleX(1);
    node.scaleY(1);

    const { constrainedPosition, constrainedSize } = constrainTransform
      ? constrainTransform({
          xPx: node.x(),
          yPx: node.y(),
          widthPx: newWidth,
          heightPx: newHeight,
          rotationDegrees: node.rotation(),
        })
      : {
          constrainedPosition: {
            x: node.x(),
            y: node.y(),
          },
          constrainedSize: {
            width: newWidth,
            height: newHeight,
          },
        };

    node.x(constrainedPosition.x);
    node.y(constrainedPosition.y);

    dispatch(
      setObjectTransform({
        guid: selectedEditorGuid,
        transform: {
          xPx: constrainedPosition.x,
          yPx: constrainedPosition.y,
          widthPx: constrainedSize.width,
          heightPx: constrainedSize.height,
          rotationDegrees: node.rotation(),
        },
      })
    );

    if (onTransformEndExtra) onTransformEndExtra();
  }

  function onDragEnd() {
    const node = mainRef.current?.children[0];
    if (!node || !selectedEditorGuid) return;

    const { constrainedPosition, constrainedSize } = constrainTransform
      ? constrainTransform({
          xPx: node.x(),
          yPx: node.y(),
          widthPx: node.width(),
          heightPx: node.height(),
          rotationDegrees: node.rotation(),
        })
      : {
          constrainedPosition: {
            x: node.x(),
            y: node.y(),
          },
          constrainedSize: {
            width: node.width(),
            height: node.height(),
          },
        };

    node.x(constrainedPosition.x);
    node.y(constrainedPosition.y);

    dispatch(
      setObjectTransform({
        guid: selectedEditorGuid,
        transform: {
          xPx: constrainedPosition.x,
          yPx: constrainedPosition.y,
          widthPx: constrainedSize.width,
          heightPx: constrainedSize.height,
          rotationDegrees: node.rotation(),
        },
      })
    );

    if (onDragEndExtra) onDragEndExtra();
  }

  useEffect(() => {
    if (!selected) return;

    const transformer = transformerRef.current;
    const main = mainRef.current;
    const node = main?.children[0];
    if (!transformer || !node) return;

    transformer.nodes([node]);
    transformer.getLayer()?.batchDraw();

    node.on("dragstart", () => {
      if (onDragStart) onDragStart();
    });
    node.on("dragend", onDragEnd);
    node.draggable(true);

    return () => {
      node.off("dragstart", onDragStart);
      node.off("dragend", onDragEnd);
    };
  }, [selected]);

  return (
    <>
      <Group ref={mainRef}>{children}</Group>
      {selected && (
        <Transformer
          ref={transformerRef}
          onTransformStart={onTransformStart}
          onTransformEnd={onTransformEnd}
        />
      )}
    </>
  );
}
