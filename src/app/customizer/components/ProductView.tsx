"use client";

import { IMAGE_NOT_FOUND_URL } from "@/constants";
import {
  convertDesignerObjectData,
  findLocationInProductData,
  findViewInProductData,
} from "@/customizer/editor";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useRef } from "react";
import { Image, Layer, Rect, Stage } from "react-konva";
import useImage from "use-image";
import { useEditor } from "../EditorContext";
import { EditorImage } from "./productView/EditorImage";

export const editorSize = 650; //temporary; eventually width will need to be dynamic to allow for view resizing

export function ProductView() {
  const { selectedView, setSelectedEditorGuid, selectedProductData } =
    useEditor();
  const viewInProductData =
    selectedProductData && selectedView
      ? findViewInProductData(selectedProductData, selectedView.id)
      : undefined;
  const [image] = useImage(viewInProductData?.imageUrl || IMAGE_NOT_FOUND_URL);
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
      </Layer>
      {selectedView?.locations.map((location) => {
        const locationInProductData = selectedProductData
          ? findLocationInProductData(selectedProductData, location.id)
          : undefined;
        const { position, size } = convertDesignerObjectData(
          editorSize,
          editorSize,
          {
            position: {
              x: locationInProductData?.positionX || 0,
              y: locationInProductData?.positionY || 0,
            },
            size: {
              x: locationInProductData?.width || 0,
              y: locationInProductData?.height || 0,
            },
          }
        );

        return (
          <Layer
            key={location.id}
            clipX={position.x}
            clipY={position.y}
            clipWidth={size.x}
            clipHeight={size.y}
          >
            <Rect
              x={position.x}
              y={position.y}
              width={size.x}
              height={size.y}
              stroke={"gray"}
              strokeWidth={4}
            />
            {location?.artworks.map((art) => {
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
        );
      })}
    </Stage>
  );
}
