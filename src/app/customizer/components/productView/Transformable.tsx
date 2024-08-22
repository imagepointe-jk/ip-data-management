import Konva from "konva";
import { ReactNode, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";
import { useEditor } from "../../EditorContext";
import { clamp } from "@/utility/misc";

//? As of Aug. 2024 the official Konva docs say there is no official "React way" to use the Transformer.
//? This generalized component appears to work well enough for now.

type Props = {
  children: ReactNode;
  selected?: boolean;
  limits?: {
    size?: {
      minWidth?: number;
      minHeight?: number;
    };
  };
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

    setArtworkTransform(selectedEditorGuid, {
      x: node.x(),
      y: node.y(),
      width: clamp(node.width() * scaleX, 50, Infinity),
      height: clamp(node.height() * scaleY, 50, Infinity),
      rotationDegrees: node.rotation(),
    });
  }

  function onDragEnd() {
    const node = mainRef.current?.children[0];
    if (!node || !selectedEditorGuid) return;

    setArtworkTransform(selectedEditorGuid, {
      x: node.x(),
      y: node.y(),
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
