import {
  CartState,
  CartStateProductVariation,
  EditorTextData,
  EditorTextStyle,
  PlacedObject,
  PopulatedProductSettingsSerializable,
  TransformArgsPxOptional,
} from "@/types/schema/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DesignWithIncludesSerializable } from "./designData";
import { productEditorSize } from "@/constants";
import {
  findArtworkInCart,
  findTextInCart,
  findVariationInCart,
  findViewInCart,
  findViewInProductData,
  findViewWithArtworkInCart,
  findViewWithTextInCart,
} from "@/customizer/utils/find";
import { pixelTransformToNormalized } from "@/customizer/utils/convert";
import { constrainEditorObjectTransform } from "@/customizer/utils/calculate";

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
  targetViewId: number;
  targetProductData: PopulatedProductSettingsSerializable;
  newGuid: string;
};
type AddTextPayload = {
  targetViewId: number;
  targetProductData: PopulatedProductSettingsSerializable;
  newGuid: string;
};
type EditTextPayload = Omit<EditorTextData, "text"> & {
  text?: string;
  guid: string;
};

function createNewObjectData(newGuid: string) {
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
      const viewWithArtwork = findViewWithArtworkInCart(state, guid);

      if (!viewWithArtwork) throw new Error("Could not find artwork to delete");
      viewWithArtwork.artworks = viewWithArtwork.artworks.filter(
        (artwork) => artwork.objectData.editorGuid !== guid
      );
    },
    deleteTextFromState: (state, action: PayloadAction<{ guid: string }>) => {
      const { guid } = action.payload;

      const viewWithText = findViewWithTextInCart(state, guid);
      if (!viewWithText) throw new Error("Could not find text to delete");
      viewWithText.texts = viewWithText.texts.filter(
        (text) => text.objectData.editorGuid !== guid
      );
    },
    setObjectTransform: (
      state,
      action: PayloadAction<{
        guid: string;
        transform: TransformArgsPxOptional;
      }>
    ) => {
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
      const object =
        findArtworkInCart(state, guid) || findTextInCart(state, guid);
      if (!object) throw new Error("No object found to transform");

      if (positionNormalized.x)
        object.objectData.positionNormalized.x = positionNormalized.x;
      if (positionNormalized.y)
        object.objectData.positionNormalized.y = positionNormalized.y;
      if (sizeNormalized.x)
        object.objectData.sizeNormalized.x = sizeNormalized.x;
      if (sizeNormalized.y)
        object.objectData.sizeNormalized.y = sizeNormalized.y;
      if (transform.rotationDegrees)
        object.objectData.rotationDegrees = transform.rotationDegrees;
    },
    addDesign: (state, action: PayloadAction<AddArtworkPayload>) => {
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
      if (!viewInState)
        throw new Error(`View ${targetViewId} not found in state`);

      const objectData = createNewObjectData(newGuid);
      const viewInProductData = findViewInProductData(
        targetProductData,
        targetViewId
      );
      if (!viewInProductData)
        throw new Error(`View ${targetViewId} not found in product data`);
      const { constrainedPosition, constrainedSize } =
        constrainEditorObjectTransform({
          locations: viewInProductData.locations,
          objectTransform: objectData,
        });

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
            x: constrainedPosition.x,
            y: constrainedPosition.y,
          },
          sizeNormalized: {
            x: constrainedSize.x,
            y: constrainedSize.y,
          },
        },
      });
    },
    addText: (state, action: PayloadAction<AddTextPayload>) => {
      const { newGuid, targetViewId, targetProductData } = action.payload;

      const viewInState = findViewInCart(state, targetViewId);
      if (!viewInState)
        throw new Error(`View ${targetViewId} not found in state`);

      const objectData = createNewObjectData(newGuid);
      const viewInProductData = findViewInProductData(
        targetProductData,
        targetViewId
      );
      if (!viewInProductData)
        throw new Error(`View ${targetViewId} not found in product data`);
      const { constrainedPosition, constrainedSize } =
        constrainEditorObjectTransform({
          locations: viewInProductData.locations,
          objectTransform: objectData,
        });

      viewInState.texts.push({
        textData: {
          text: "New Text",
          style: {
            fontSize: 20,
            hexCode: "#000000",
            align: "left",
          },
        },
        objectData: {
          ...objectData,
          positionNormalized: {
            x: constrainedPosition.x,
            y: constrainedPosition.y,
          },
          sizeNormalized: {
            x: constrainedSize.x,
            y: constrainedSize.y,
          },
        },
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
      if (incomingStyle.fontFamily !== undefined)
        text.textData.style.fontFamily = incomingStyle.fontFamily;
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
        label: variationData.color.name,
        views: variationData.views.map((view) => ({
          id: view.id,
          label: view.name,
          artworks: [],
          texts: [],
          currentRenderUrl: view.imageUrl,
        })),
        quantities: {
          "2xl": 0,
          "3xl": 0,
          "4xl": 0,
          "5xl": 0,
          "6xl": 0,
          l: 0,
          m: 0,
          s: 0,
          xl: 0,
        },
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
    changeProductVariationQuantities: (
      state,
      action: PayloadAction<{
        targetVariationId: number;
        newQuantities: {
          s?: number;
          m?: number;
          l?: number;
          xl?: number;
          ["2xl"]?: number;
          ["3xl"]?: number;
          ["4xl"]?: number;
          ["5xl"]?: number;
          ["6xl"]?: number;
        };
      }>
    ) => {
      const { targetVariationId, newQuantities } = action.payload;
      const variationInState = findVariationInCart(state, targetVariationId);
      if (!variationInState)
        throw new Error(`Variation ${targetVariationId} not found in state`);

      const quantities = variationInState.quantities;
      if (newQuantities.s) quantities.s = newQuantities.s;
      if (newQuantities.m) quantities.m = newQuantities.m;
      if (newQuantities.l) quantities.l = newQuantities.l;
      if (newQuantities.xl) quantities.xl = newQuantities.xl;
      if (newQuantities["2xl"]) quantities["2xl"] = newQuantities["2xl"];
      if (newQuantities["3xl"]) quantities["3xl"] = newQuantities["3xl"];
      if (newQuantities["4xl"]) quantities["4xl"] = newQuantities["4xl"];
      if (newQuantities["5xl"]) quantities["5xl"] = newQuantities["5xl"];
      if (newQuantities["6xl"]) quantities["6xl"] = newQuantities["6xl"];
    },
    setViewRenderURL: (
      state,
      action: PayloadAction<{ viewId: number; url: string }>
    ) => {
      const { url, viewId } = action.payload;
      const view = findViewInCart(state, viewId);
      if (!view) throw new Error(`View id ${viewId} not found`);

      view.currentRenderUrl = url;
    },
    pruneCart: (
      state,
      action: PayloadAction<{ variationIdToPreserve?: number }>
    ) => {
      const { variationIdToPreserve } = action.payload;

      //get rid of variations present in cart that have no designs, text, etc.
      //currently only prune variations within each product, rather than also pruning products, because we currently only support one product in the cart at a time
      for (const product of state.products) {
        product.variations = product.variations.filter((variation) => {
          const hasAnyDesign = !!variation.views.find(
            (view) => view.artworks.length > 0 || view.texts.length > 0
          );
          return variation.id === variationIdToPreserve || hasAnyDesign;
        });
      }
    },
  },
});

export const {
  setCartProducts,
  addDesign,
  addText,
  addProductVariation,
  deleteArtworkFromState,
  deleteTextFromState,
  removeProductVariation,
  changeProductVariationQuantities,
  setObjectTransform,
  editText,
  setViewRenderURL,
  pruneCart,
} = cartSlice.actions;
