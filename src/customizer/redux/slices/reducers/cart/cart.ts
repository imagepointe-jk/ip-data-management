import {
  findVariationInCart,
  findViewWithArtworkInCart,
  findViewWithTextInCart,
} from "@/customizer/utils/find";
import {
  cloneArtwork,
  cloneText,
  createProductVariationForState,
} from "@/customizer/utils/misc";
import {
  CartState,
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

  const newVariation = createProductVariationForState(
    variationId,
    targetProductData
  );
  const productInState = state.products.find(
    (product) => product.id === targetProductData.id
  )!;

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

export function deleteObjectFromState(
  state: CartState,
  action: PayloadAction<{ guid: string }>
) {
  const { guid } = action.payload;
  const viewWithArtwork = findViewWithArtworkInCart(state, guid);
  const viewWithText = findViewWithTextInCart(state, guid);

  if (viewWithArtwork) {
    viewWithArtwork.artworks = viewWithArtwork.artworks.filter(
      (artwork) => artwork.objectData.editorGuid !== guid
    );
  } else if (viewWithText) {
    viewWithText.texts = viewWithText.texts.filter(
      (text) => text.objectData.editorGuid !== guid
    );
  } else console.error("Guid not found for delete operation");
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
  if (!sourceVariation)
    throw new Error(
      `Source variation id ${sourceVariationId} not found in state`
    );

  const targetVariation = findVariationInCart(state, targetVariationId);

  if (!targetVariation)
    throw new Error(`Variation ${targetVariationId} not found`);

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

export function setFirstName(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.firstName = action.payload;
}

export function setLastName(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.lastName = action.payload;
}

export function setEmail(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.email = action.payload;
}

export function setCompany(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.company = action.payload;
}

export function setLocal(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.local = action.payload;
}

export function setPhone(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.phone = action.payload;
}

export function setComments(state: CartState, action: PayloadAction<string>) {
  state.contactInfo.comments = action.payload;
}
