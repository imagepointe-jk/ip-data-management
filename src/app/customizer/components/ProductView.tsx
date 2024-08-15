"use client";

import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { convertDesignerObjectData } from "@/customizer/editor";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useRef } from "react";
import { Image, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { useEditor } from "../EditorContext";
import { EditorImage } from "./productView/EditorImage";

const editorSize = 650; //temporary; eventually width will need to be dynamic to allow for view resizing

export function ProductView() {
  const { selectedView, designState, setSelectedEditorGuid } = useEditor();
  const [image] = useImage(selectedView?.imageUrl || IMAGE_NOT_FOUND_URL);
  const productImgRef = useRef<Konva.Image>(null);

  function onClickStage(e: KonvaEventObject<MouseEvent>) {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target === productImgRef.current;
    if (clickedOnEmpty) setSelectedEditorGuid(null);
  }

  return (
    <Stage
      width={editorSize}
      height={editorSize}
      style={{ position: "absolute", left: "300px", top: "25px" }}
      scale={{ x: 1, y: 1 }}
      onMouseDown={onClickStage}
    >
      <Layer>
        <Image
          ref={productImgRef}
          image={image}
          width={editorSize}
          height={editorSize}
        />
        {designState.artworks.map((art) => {
          const { position, size } = convertDesignerObjectData(
            editorSize,
            editorSize,
            art.objectData
          );
          return (
            <EditorImage
              key={art.objectData.editorGuid}
              editorGuid={art.objectData.editorGuid}
              src={art.imageUrl}
              x={position.x}
              y={position.y}
              width={size.x}
              height={size.y}
              rotationDeg={art.objectData.rotationDegrees}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
