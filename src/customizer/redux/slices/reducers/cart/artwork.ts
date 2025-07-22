import { findViewInCart, findViewInProductData } from "@/customizer/utils/find";
import {
  CartState,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import { PayloadAction } from "@reduxjs/toolkit";
import { DesignWithIncludesSerializable } from "../../designData";
import { snapToNearest } from "@/utility/geometry";
import { createNewObjectData } from "./object";

type AddArtworkPayload = {
  addDesignPayload?: {
    designId: number;
    variationId?: number;
    designData: DesignWithIncludesSerializable[];
  };
  addUploadPayload?: {
    uploadedUrl: string;
  };
  targetViewId: number;
  targetProductData: PopulatedProductSettingsSerializable;
  newGuid: string;
};
export function addDesign(
  state: CartState,
  action: PayloadAction<AddArtworkPayload>
) {
  const {
    addDesignPayload,
    addUploadPayload,
    targetViewId,
    newGuid,
    targetProductData,
  } = action.payload;
  let imageUrl = null as string | null;

  if (addDesignPayload) {
    const { designData, designId, variationId } = addDesignPayload;
    const design = designData.find((design) => design.id === designId);
    const variation = design?.variations.find(
      (variation) => variation.id === variationId
    );

    if (!design) throw new Error(`Design ${designId} not found.`);
    if (!variation && variationId !== undefined)
      throw new Error(
        `Variation ${variationId} of design ${designId} not found.`
      );

    imageUrl = variation?.imageUrl || design.imageUrl;
  } else if (addUploadPayload) {
    imageUrl = addUploadPayload.uploadedUrl;
  } else {
    throw new Error("Invalid payload.");
  }

  const viewInState = findViewInCart(state, targetViewId);
  if (!viewInState) throw new Error(`View ${targetViewId} not found in state`);

  const objectData = createNewObjectData(newGuid);
  const viewInProductData = findViewInProductData(
    targetProductData,
    targetViewId
  );
  if (!viewInProductData)
    throw new Error(`View ${targetViewId} not found in product data`);
  const snapped = snapToNearest(
    {
      position: {
        x: objectData.positionNormalized.x,
        y: objectData.positionNormalized.y,
      },
      size: {
        x: objectData.sizeNormalized.x,
        y: objectData.sizeNormalized.y,
      },
    },
    viewInProductData.locations.map((location) => ({
      position: { x: location.positionX, y: location.positionY },
      size: { x: location.width, y: location.height },
    }))
  );

  viewInState.artworks.push({
    imageUrl,
    identifiers: {
      designIdentifiers: addDesignPayload
        ? {
            designId: addDesignPayload.designId,
            variationId: addDesignPayload.variationId,
          }
        : undefined,
    },
    objectData: {
      ...objectData,
      positionNormalized: {
        x: snapped.position.x,
        y: snapped.position.y,
      },
      sizeNormalized: {
        x: snapped.size.x,
        y: snapped.size.y,
      },
    },
  });
}
