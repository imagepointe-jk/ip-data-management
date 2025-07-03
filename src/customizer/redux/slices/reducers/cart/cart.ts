import { findVariationInCart } from "@/customizer/utils/find";
import { cloneArtwork, cloneText } from "@/customizer/utils/misc";
import {
  CartState,
  CartStateProductVariation,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import { PayloadAction } from "@reduxjs/toolkit";

export function setCartProducts(
  state: CartState,
  action: PayloadAction<CartState>
) {
  state.products = action.payload.products;
}

export function addProductVariation(
  state: CartState,
  action: PayloadAction<{
    variationId: number;
    targetProductData: PopulatedProductSettingsSerializable;
  }>
) {
  const { targetProductData, variationId } = action.payload;

  const existingVariation = findVariationInCart(state, variationId);
  if (existingVariation)
    throw new Error(
      `Tried to add additional instance of variation ${variationId}`
    );

  const variationData = targetProductData.variations.find(
    (variation) => variation.id === variationId
  );
  if (!variationData) throw new Error(`Variation id ${variationId} not found`);

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
}

export function removeProductVariation(
  state: CartState,
  action: PayloadAction<{ targetProductId: number; variationId: number }>
) {
  const { targetProductId, variationId } = action.payload;

  const productInState = state.products.find(
    (product) => product.id === targetProductId
  );
  if (!productInState)
    throw new Error(`Product id ${targetProductId} not found in state`);

  productInState.variations = productInState.variations.filter(
    (variation) => variation.id !== variationId
  );
}

export function changeProductVariationQuantities(
  state: CartState,
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
) {
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
}

export function pruneCart(
  state: CartState,
  action: PayloadAction<{ variationIdToPreserve?: number }>
) {
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
}

//note that this copy function depends on view indices corresponding correctly to each other.
//e.g. view 0 of the source variation is a front view, and view 0 of the target variation is ALSO a front view.
//this is currently not enforced or guaranteed in any way, and a safer approach might be better in the future.
export function copyDesign(
  state: CartState,
  action: PayloadAction<{
    sourceVariationId: number;
    targetVariationId: number;
  }>
) {
  const { sourceVariationId, targetVariationId } = action.payload;
  const sourceVariation = findVariationInCart(state, sourceVariationId);
  const targetVariation = findVariationInCart(state, targetVariationId);
  if (!sourceVariation)
    throw new Error(
      `Source variation id ${sourceVariationId} not found in state`
    );
  if (!targetVariation)
    throw new Error(
      `Target variation id ${targetVariationId} not found in state`
    );

  for (let i = 0; i < targetVariation.views.length; i++) {
    const targetView = targetVariation.views[i]!;
    const sourceView = sourceVariation.views[i];
    if (!sourceView) {
      console.error(
        `No source view index ${i} corresponding to target view index ${i}`
      );
      continue;
    }
    targetView.artworks = sourceView.artworks.map((artwork) =>
      cloneArtwork(artwork)
    );
    targetView.texts = sourceView.texts.map((text) => cloneText(text));
  }
}
