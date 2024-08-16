"use client";

import { IMAGE_NOT_FOUND_URL } from "@/constants";
import {
  convertDesignerObjectData,
  findLocationInState,
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
  const {
    selectedView,
    selectedLocation,
    designState,
    setSelectedEditorGuid,
    selectedProductData,
  } = useEditor();
  const [image] = useImage(selectedView?.imageUrl || IMAGE_NOT_FOUND_URL);
  const productImgRef = useRef<Konva.Image>(null);
  const location = selectedLocation
    ? findLocationInState(designState, selectedLocation.id)
    : undefined;
  console.log(selectedLocation);

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
      {selectedView?.locations.map((location) => {
        const { position, size } = convertDesignerObjectData(
          editorSize,
          editorSize,
          {
            position: {
              x: location.positionX,
              y: location.positionY,
            },
            size: {
              x: location.width,
              y: location.height,
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
          </Layer>
        );
      })}
    </Stage>
  );
}
