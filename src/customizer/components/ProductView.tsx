"use client";

import { IMAGE_NOT_FOUND_URL, productEditorSize } from "@/constants";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useRef, useState } from "react";
import { Image, Layer, Rect, Stage } from "react-konva";
import useImage from "use-image";
import {
  setDialogOpen,
  setSelectedEditorGuid,
  useEditorSelectors,
} from "../redux/slices/editor";
import { useDispatch } from "react-redux";
import { LocationFrames } from "./productView/LocationFrames";
import { getConfinedRectDimensions } from "@/utility/misc";
import { EditorObject } from "./productView/EditorObject";
import { findViewInProductData } from "../utils/find";
import { convertDesignerObjectData } from "../utils/convert";

export function ProductView() {
  const { selectedView, selectedProductData } = useEditorSelectors();
  const dispatch = useDispatch();

  const viewInProductData = findViewInProductData(
    selectedProductData,
    selectedView.id
  );
  if (!viewInProductData) throw new Error(`View ${selectedView.id} not found`);
  const [image] = useImage(viewInProductData?.imageUrl || IMAGE_NOT_FOUND_URL);
  if (image) image.crossOrigin = "Anonymous"; //without this, CORS will cause a "tainted canvas" error when trying to export the canvas
  const productImgRef = useRef<Konva.Image>(null);
  const { width: imageWidthConfined, height: imageHeightConfined } =
    getConfinedRectDimensions(
      { width: image?.width || 0, height: image?.height || 0 },
      { width: productEditorSize, height: productEditorSize }
    );
  const centeredImageX = (productEditorSize - imageWidthConfined) / 2;
  const centeredImageY = (productEditorSize - imageHeightConfined) / 2;
  const [showLocationFrames, setShowLocationFrames] = useState(false);

  function onClickStage(e: KonvaEventObject<MouseEvent>) {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target === productImgRef.current;
    if (clickedOnEmpty) {
      dispatch(setSelectedEditorGuid(null));
      dispatch(setDialogOpen(null));
    }
  }

  return (
    <Stage
      width={productEditorSize}
      height={productEditorSize}
      style={{ position: "absolute", left: "300px", top: "25px" }}
      scale={{ x: 1, y: 1 }}
      onMouseDown={onClickStage}
    >
      <Layer>
        {/* White background to keep PNG renders from having black pixels */}

        <Rect
          x={0}
          y={0}
          width={productEditorSize}
          height={productEditorSize}
          fill={"#ffffff"}
        />

        {/* Product image */}

        <Image
          ref={productImgRef}
          image={image}
          x={centeredImageX}
          y={centeredImageY}
          width={imageWidthConfined}
          height={imageHeightConfined}
        />

        {/* Location frames */}

        {showLocationFrames && (
          <LocationFrames locations={viewInProductData.locations} />
        )}
      </Layer>

      {/* Artworks */}

      <Layer>
        {selectedView.artworks.map((art) => {
          const {
            objectData: {
              positionNormalized,
              sizeNormalized,
              editorGuid,
              rotationDegrees,
            },
            imageUrl,
          } = art;
          const { position, size } = convertDesignerObjectData(
            productEditorSize,
            productEditorSize,
            {
              positionNormalized,
              sizeNormalized,
            }
          );
          return (
            <EditorObject
              key={editorGuid}
              editorGuid={editorGuid}
              rotationDeg={rotationDegrees}
              width={size.x}
              height={size.y}
              x={position.x}
              y={position.y}
              imageData={{ src: imageUrl }}
              locations={viewInProductData.locations}
              setShowLocationFrames={setShowLocationFrames}
            />
          );
        })}

        {/* Texts */}

        {selectedView.texts.map((text) => {
          const {
            objectData: {
              positionNormalized,
              sizeNormalized,
              editorGuid,
              rotationDegrees,
            },
            textData,
          } = text;
          const { position, size } = convertDesignerObjectData(
            productEditorSize,
            productEditorSize,
            {
              positionNormalized,
              sizeNormalized,
            }
          );
          return (
            <EditorObject
              key={editorGuid}
              editorGuid={editorGuid}
              rotationDeg={rotationDegrees}
              width={size.x}
              height={size.y}
              x={position.x}
              y={position.y}
              textData={textData}
              locations={viewInProductData.locations}
              setShowLocationFrames={setShowLocationFrames}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
