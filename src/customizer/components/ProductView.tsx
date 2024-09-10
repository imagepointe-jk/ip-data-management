"use client";

import { IMAGE_NOT_FOUND_URL } from "@/constants";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useRef, useState } from "react";
import { Image, Layer, Rect, Stage } from "react-konva";
import useImage from "use-image";
import {
  convertDesignerObjectData,
  findLocationInProductData,
  findViewInProductData,
} from "../utils";
import {
  setSelectedEditorGuid,
  useEditorSelectors,
} from "../redux/slices/editor";
import { useDispatch } from "react-redux";
import { LocationFrames } from "./productView/LocationFrames";
import { LocationWithArtworks } from "./productView/LocationWithArtworks";

export const editorSize = 650; //temporary; eventually width will need to be dynamic to allow for view resizing

export function ProductView() {
  const { selectedView, selectedProductData } = useEditorSelectors();
  const dispatch = useDispatch();

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
    if (clickedOnEmpty) dispatch(setSelectedEditorGuid(null));
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
        {/* Product image */}

        <Image
          ref={productImgRef}
          image={image}
          width={editorSize}
          height={editorSize}
          onMouseEnter={() => setShowLocationFrames(false)} //if mouse is detected by the image, it must be outside the central area
        />

        {/* Central area: location frames visible when mouse is over this rect */}

        <Rect
          x={50}
          y={50}
          width={550}
          height={550}
          onMouseEnter={() => setShowLocationFrames(true)}
          onClick={() => dispatch(setSelectedEditorGuid(null))}
        />

        {/* Location frames */}

        {showLocationFrames && (
          <LocationFrames locations={viewInProductData.locations} />
        )}
      </Layer>

      {/* Locations with artwork */}

      {selectedView.locations.map((location) => {
        const locationInProductData = selectedProductData
          ? findLocationInProductData(selectedProductData, location.id)
          : undefined;
        const { position: locationPosition, size: locationSize } =
          convertDesignerObjectData(editorSize, editorSize, {
            positionNormalized: {
              x: locationInProductData?.positionX || 0,
              y: locationInProductData?.positionY || 0,
            },
            sizeNormalized: {
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
            <LocationWithArtworks
              locationInState={location}
              locationPosition={locationPosition}
              locationSize={locationSize}
            />
          </Layer>
        );
      })}
    </Stage>
  );
}
