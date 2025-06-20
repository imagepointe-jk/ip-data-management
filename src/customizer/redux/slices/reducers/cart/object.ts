import { productEditorSize } from "@/constants";
import { pixelTransformToNormalized } from "@/customizer/utils/convert";
import { findArtworkInCart, findTextInCart } from "@/customizer/utils/find";
import {
  CartState,
  PlacedObject,
  TransformArgsPxOptional,
} from "@/types/schema/customizer";
import { PayloadAction } from "@reduxjs/toolkit";

export function setObjectTransform(
  state: CartState,
  action: PayloadAction<{
    guid: string;
    transform: TransformArgsPxOptional;
  }>
) {
  //expects absolute px amounts for position and size.
  //will convert to 0-1 range for storing in state.
  const { guid, transform } = action.payload;
  const { positionNormalized, sizeNormalized } = pixelTransformToNormalized(
    productEditorSize,
    productEditorSize,
    {
      xPx: transform.xPx || 0,
      yPx: transform.yPx || 0,
      widthPx: transform.widthPx || 0,
      heightPx: transform.heightPx || 0,
      rotationDegrees: transform.rotationDegrees || 0,
    }
  );
  const object = findArtworkInCart(state, guid) || findTextInCart(state, guid);
  if (!object) throw new Error("No object found to transform");

  if (positionNormalized.x)
    object.objectData.positionNormalized.x = positionNormalized.x;
  if (positionNormalized.y)
    object.objectData.positionNormalized.y = positionNormalized.y;
  if (sizeNormalized.x) object.objectData.sizeNormalized.x = sizeNormalized.x;
  if (sizeNormalized.y) object.objectData.sizeNormalized.y = sizeNormalized.y;
  if (transform.rotationDegrees)
    object.objectData.rotationDegrees = transform.rotationDegrees;
}

export function createNewObjectData(newGuid: string) {
  const newObject: PlacedObject = {
    positionNormalized: {
      x: 0,
      y: 0,
    },
    sizeNormalized: {
      x: 0.2,
      y: 0.2,
    },
    rotationDegrees: 0,
    editorGuid: newGuid,
  };

  return newObject;
}
