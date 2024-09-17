import {
  CartState,
  CartStateProductVariation,
  EditorTextData,
  EditorTextStyle,
  PlacedObject,
  PopulatedProductSettingsSerializable,
  TransformArgsPx,
} from "@/types/schema/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DesignWithIncludesSerializable } from "./designData";
import {
  convertTransformArgs,
  findArtworkInCart,
  findLocationInProductData,
  findLocationInCart,
  findLocationWithArtworkInCart,
  findVariationInCart,
  findTextInCart,
} from "@/customizer/utils";
import { editorSize } from "@/customizer/components/ProductView";

const initialState: CartState = {
  products: [],
};
type AddArtworkPayload = {
  addDesignPayload?: {
    designId: number;
    variationId?: number;
    designData: DesignWithIncludesSerializable[];
  };
  addUploadPayload?: {
    uploadedUrl: string;
  };
  targetLocationId: number;
  targetProductData: PopulatedProductSettingsSerializable;
  newGuid: string;
};
type AddTextPayload = {
  targetLocationId: number;
  targetProductData: PopulatedProductSettingsSerializable;
  newGuid: string;
};
type EditTextPayload = Omit<EditorTextData, "text"> & {
  text?: string;
  guid: string;
};

function createNewObjectData(
  targetProductData: PopulatedProductSettingsSerializable,
  targetLocationId: number,
  newGuid: string
) {
  const locationData = findLocationInProductData(
    targetProductData,
    targetLocationId
  );
  if (!locationData)
    throw new Error(`Location data for location ${targetLocationId} not found`);

  const smallestSize = [locationData.width, locationData.height].sort(
    (a, b) => a - b
  )[0]!;

  const newObject: PlacedObject = {
    positionNormalized: {
      x: locationData.positionX,
      y: locationData.positionY,
    },
    sizeNormalized: {
      //currently only supports square objects
      //if a rectangular one is used, the aspect ratio will be forced into 1:1
      x: smallestSize,
      y: smallestSize,
    },
    rotationDegrees: 0,
    editorGuid: newGuid,
  };

  return newObject;
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartProducts: (state, action: PayloadAction<CartState>) => {
      state.products = action.payload.products;
    },
    deleteArtworkFromState: (
      state,
      action: PayloadAction<{ guid: string }>
    ) => {
      const { guid } = action.payload;
      const locationWithArtwork = findLocationWithArtworkInCart(state, guid);
      if (!locationWithArtwork)
        throw new Error("Could not find artwork to delete");
      locationWithArtwork.artworks = locationWithArtwork.artworks.filter(
        (artwork) => artwork.objectData.editorGuid !== guid
      );
    },
    setObjectTransform: (
      state,
      action: PayloadAction<{ guid: string; transform: TransformArgsPx }>
    ) => {
      //expects absolute px amounts for position and size.
      //will convert to 0-1 range for storing in state.
      const { guid, transform } = action.payload;
      const { xNormalized, yNormalized, widthNormalized, heightNormalized } =
        convertTransformArgs(editorSize, editorSize, transform);
      const object =
        findArtworkInCart(state, guid) || findTextInCart(state, guid);
      if (!object) throw new Error("No object found to transform");

      if (xNormalized) object.objectData.positionNormalized.x = xNormalized;
      if (yNormalized) object.objectData.positionNormalized.y = yNormalized;
      if (widthNormalized) object.objectData.sizeNormalized.x = widthNormalized;
      if (heightNormalized)
        object.objectData.sizeNormalized.y = heightNormalized;
      if (transform.rotationDegrees)
        object.objectData.rotationDegrees = transform.rotationDegrees;
    },
    addDesign: (state, action: PayloadAction<AddArtworkPayload>) => {
      const {
        addDesignPayload,
        addUploadPayload,
        targetLocationId,
        targetProductData,
        newGuid,
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

      const locationInState = findLocationInCart(state, targetLocationId);
      if (!locationInState)
        throw new Error(`Location ${targetLocationId} not found in state`);

      locationInState.artworks.push({
        imageUrl,
        identifiers: {
          designIdentifiers: addDesignPayload
            ? {
                designId: addDesignPayload.designId,
                variationId: addDesignPayload.variationId,
              }
            : undefined,
        },
        objectData: createNewObjectData(
          targetProductData,
          targetLocationId,
          newGuid
        ),
      });
    },
    addText: (state, action: PayloadAction<AddTextPayload>) => {
      const { newGuid, targetLocationId, targetProductData } = action.payload;

      const locationInState = findLocationInCart(state, targetLocationId);
      if (!locationInState)
        throw new Error(`Location ${targetLocationId} not found in state`);

      locationInState.texts.push({
        textData: {
          text: "New Text",
          style: {
            fontSize: 20,
            hexCode: "#000000",
            align: "left",
          },
        },
        objectData: createNewObjectData(
          targetProductData,
          targetLocationId,
          newGuid
        ),
      });
    },
    editText: (state, action: PayloadAction<EditTextPayload>) => {
      const { guid, style: incomingStyle, text: incomingText } = action.payload;
      const text = findTextInCart(state, guid);
      if (!text) throw new Error("Text not found");

      const { textData } = text;
      if (incomingText !== undefined) textData.text = incomingText;

      if (!incomingStyle) return;

      const newStyle: EditorTextStyle = {};
      text.textData.style = text.textData.style || newStyle;

      if (incomingStyle.align) text.textData.style.align = incomingStyle.align;
      if (incomingStyle.fontSize)
        text.textData.style.fontSize = incomingStyle.fontSize;
      if (incomingStyle.fontStyle !== undefined)
        text.textData.style.fontStyle = incomingStyle.fontStyle || undefined;
      if (incomingStyle.hexCode !== undefined)
        text.textData.style.hexCode = incomingStyle.hexCode || undefined;
      if (incomingStyle.strokeHexCode !== undefined)
        text.textData.style.strokeHexCode =
          incomingStyle.strokeHexCode || undefined;
      if (incomingStyle.strokeWidth !== undefined)
        text.textData.style.strokeWidth = incomingStyle.strokeWidth;
      if (incomingStyle.textDecoration !== undefined)
        text.textData.style.textDecoration = incomingStyle.textDecoration;
    },
    addProductVariation: (
      state,
      action: PayloadAction<{
        variationId: number;
        targetProductData: PopulatedProductSettingsSerializable;
      }>
    ) => {
      const { targetProductData, variationId } = action.payload;

      const existingVariation = findVariationInCart(state, variationId);
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
      const newVariation: CartStateProductVariation = {
        id: variationData.id,
        views: variationData.views.map((view) => ({
          id: view.id,
          locations: view.locations.map((location) => ({
            id: location.id,
            artworks: [],
            texts: [],
          })),
        })),
      };

      productInState?.variations.push(newVariation);
    },
    removeProductVariation: (
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
  addText,
  addProductVariation,
  deleteArtworkFromState,
  removeProductVariation,
  setObjectTransform,
  editText,
} = cartSlice.actions;
