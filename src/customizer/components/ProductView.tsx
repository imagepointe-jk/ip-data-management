"use client";

import { IMAGE_NOT_FOUND_URL } from "@/constants";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useRef, useState } from "react";
import { Image, Layer, Rect, Stage } from "react-konva";
import useImage from "use-image";
import { useEditor } from "../EditorContext";
import { EditorImage } from "./productView/EditorImage";
import {
  convertDesignerObjectData,
  findLocationInProductData,
  findViewInProductData,
} from "../utils";

export const editorSize = 650; //temporary; eventually width will need to be dynamic to allow for view resizing

export function ProductView() {
  const {
    selectedView,
    setSelectedEditorGuid,
    selectedProductData,
    selectedLocation,
    setSelectedLocationId,
  } = useEditor();
  const viewInProductData = findViewInProductData(
    selectedProductData,
    selectedView.id
  );
  if (!viewInProductData) throw new Error(`View ${selectedView.id} not found`);
  const [image] = useImage(viewInProductData?.imageUrl || IMAGE_NOT_FOUND_URL);
  const productImgRef = useRef<Konva.Image>(null);
  const [showLocationFrames, setShowLocationFrames] = useState(false);

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
        {/* Detect mouse starting to leave product image */}
        <Image
          ref={productImgRef}
          image={image}
          width={editorSize}
          height={editorSize}
          onMouseEnter={() => setShowLocationFrames(false)}
        />
      </Layer>
      <Layer>
        {/* Detect mouse hovering over product image */}
        <Rect
          x={50}
          y={50}
          width={550}
          height={550}
          onMouseEnter={() => setShowLocationFrames(true)}
          onClick={() => setSelectedEditorGuid(null)}
        />
      </Layer>
      <Layer>
        {showLocationFrames &&
          viewInProductData.locations.map((location) => {
            const { position, size } = convertDesignerObjectData(
              editorSize,
              editorSize,
              {
                position: {
                  x: location.positionX || 0,
                  y: location.positionY || 0,
                },
                size: {
                  x: location.width || 0,
                  y: location.height || 0,
                },
              }
            );

            return (
              <Rect
                key={location.id}
                x={position.x}
                y={position.y}
                width={size.x}
                height={size.y}
                stroke={"gray"}
                strokeWidth={4}
                opacity={selectedLocation.id === location.id ? 1 : 0.3}
                onClick={() => {
                  setSelectedLocationId(location.id);
                  setSelectedEditorGuid(null);
                }}
              />
            );
          })}
      </Layer>
      {selectedView.locations.map((location) => {
        const locationInProductData = selectedProductData
          ? findLocationInProductData(selectedProductData, location.id)
          : undefined;
        const { position: locationPosition, size: locationSize } =
          convertDesignerObjectData(editorSize, editorSize, {
            position: {
              x: locationInProductData?.positionX || 0,
              y: locationInProductData?.positionY || 0,
            },
            size: {
              x: locationInProductData?.width || 0,
              y: locationInProductData?.height || 0,
            },
          });

        return (
          <Layer
            key={location.id}
            clipX={locationPosition.x}
            clipY={locationPosition.y}
            clipWidth={locationSize.x}
            clipHeight={locationSize.y}
          >
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
                  limits={{
                    size: {
                      min: {
                        width: 50,
                        height: 50,
                      },
                      max: {
                        width: locationSize.x,
                        height: locationSize.y,
                      },
                    },
                    boundingRect: {
                      topLeft: {
                        x: locationPosition.x,
                        y: locationPosition.y,
                      },
                      bottomRight: {
                        x: locationPosition.x + locationSize.x,
                        y: locationPosition.y + locationSize.y,
                      },
                    },
                  }}
                />
              );
            })}
          </Layer>
        );
      })}
    </Stage>
  );
}
