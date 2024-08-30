import {
  DesignState,
  DesignStateVariation,
  PlacedObject,
  TransformArgsPx,
} from "@/types/schema/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DesignWithIncludesSerializable } from "./designData";
import {
  convertTransformArgs,
  findArtworkInState,
  findLocationInProductData,
  findLocationInState,
  findLocationWithArtworkInState,
  findVariationInState,
} from "@/customizer/utils";
import { FullProductSettingsSerializable } from "./productData";
import { editorSize } from "@/customizer/components/ProductView";

const initialState: DesignState = {
  products: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartProducts: (state, action: PayloadAction<DesignState>) => {
      state.products = action.payload.products;
    },
    deleteArtworkFromState: (
      state,
      action: PayloadAction<{ guid: string }>
    ) => {
      const { guid } = action.payload;
      const locationWithArtwork = findLocationWithArtworkInState(state, guid);
      if (!locationWithArtwork)
        throw new Error("Could not find artwork to delete");
      locationWithArtwork.artworks = locationWithArtwork.artworks.filter(
        (artwork) => artwork.objectData.editorGuid !== guid
      );
    },
    setArtworkTransform: (
      state,
      action: PayloadAction<{ guid: string; transform: TransformArgsPx }>
    ) => {
      //expects absolute px amounts for position and size.
      //will convert to 0-1 range for storing in state.
      const { guid, transform } = action.payload;
      const { xNormalized, yNormalized, widthNormalized, heightNormalized } =
        convertTransformArgs(editorSize, editorSize, transform);
      const artwork = findArtworkInState(state, guid);
      if (!artwork) throw new Error("No artwork found to transform");

      if (xNormalized) artwork.objectData.positionNormalized.x = xNormalized;
      if (yNormalized) artwork.objectData.positionNormalized.y = yNormalized;
      if (widthNormalized)
        artwork.objectData.sizeNormalized.x = widthNormalized;
      if (heightNormalized)
        artwork.objectData.sizeNormalized.y = heightNormalized;
      if (transform.rotationDegrees)
        artwork.objectData.rotationDegrees = transform.rotationDegrees;
    },
    addDesign: (
      state,
      action: PayloadAction<{
        designId: number;
        variationId?: number;
        targetLocationId: number;
        designData: DesignWithIncludesSerializable[];
        targetProductData: FullProductSettingsSerializable;
        newGuid: string;
      }>
    ) => {
      const {
        designData,
        designId,
        variationId,
        targetLocationId,
        targetProductData,
        newGuid,
      } = action.payload;
      const design = designData.find((design) => design.id === designId);
      const variation = design?.variations.find(
        (variation) => variation.id === variationId
      );

      if (!design) throw new Error(`Design ${designId} not found.`);
      if (!variation && variationId !== undefined)
        throw new Error(
          `Variation ${variationId} of design ${designId} not found.`
        );

      const locationData = findLocationInProductData(
        targetProductData,
        targetLocationId
      );
      if (!locationData)
        throw new Error(
          `Location data for location ${targetLocationId} not found`
        );

      const smallestSize = [locationData.width, locationData.height].sort(
        (a, b) => a - b
      )[0]!;

      const newObject: PlacedObject = {
        positionNormalized: {
          x: locationData.positionX,
          y: locationData.positionY,
        },
        sizeNormalized: {
          //currently only supports square images
          //if a rectangular one is used, the aspect ratio will be forced into 1:1
          x: smallestSize,
          y: smallestSize,
        },
        rotationDegrees: 0,
        editorGuid: newGuid,
      };

      const locationInState = findLocationInState(state, targetLocationId);
      if (!locationInState)
        throw new Error(`Location ${targetLocationId} not found in state`);

      locationInState.artworks.push({
        imageUrl: variation?.imageUrl || design.imageUrl,
        identifiers: {
          designId: design.id,
          variationId: variation?.id,
        },
        objectData: newObject,
      });
    },
    addVariation: (
      state,
      action: PayloadAction<{
        variationId: number;
        targetProductData: FullProductSettingsSerializable;
      }>
    ) => {
      const { targetProductData, variationId } = action.payload;

      const existingVariation = findVariationInState(state, variationId);
      if (existingVariation)
        throw new Error(
          `Tried to add additional instance of variation ${variationId}`
        );

      const variationData = targetProductData.variations.find(
        (variation) => variation.id === variationId
      );
      if (!variationData)
        throw new Error(`Variation id ${variationId} not found`);

      const productInState = state.products.find(
        (product) => product.id === targetProductData.id
      )!;
      const newVariation: DesignStateVariation = {
        id: variationData.id,
        views: variationData.views.map((view) => ({
          id: view.id,
          locations: view.locations.map((location) => ({
            id: location.id,
            artworks: [],
          })),
        })),
      };

      productInState?.variations.push(newVariation);
    },
    removeVariation: (
      state,
      action: PayloadAction<{ targetProductId: number; variationId: number }>
    ) => {
      const { targetProductId, variationId } = action.payload;

      const productInState = state.products.find(
        (product) => product.id === targetProductId
      );
      if (!productInState)
        throw new Error(`Product id ${targetProductId} not found in state`);

      productInState.variations = productInState.variations.filter(
        (variation) => variation.id !== variationId
      );
    },
  },
});

export const {
  setCartProducts,
  addDesign,
  addVariation,
  deleteArtworkFromState,
  removeVariation,
  setArtworkTransform,
} = cartSlice.actions;