import { PopulatedProductSettings } from "@/types/dto/customizer";
import {
  CartState,
  // PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import { wrap } from "@/utility/misc";

export function findVariationInCart(cart: CartState, id: number) {
  return allVariationsInCart(cart).find((variation) => variation.id === id);
}

export function findViewInCart(cart: CartState, id: number) {
  return allViewsInCart(cart).find((location) => location.id === id);
}

export function findViewWithArtworkInCart(
  cart: CartState,
  artworkGuid: string
) {
  return allViewsInCart(cart).find(
    (view) =>
      !!view.artworks.find((art) => art.objectData.editorGuid === artworkGuid)
  );
}

export function findViewWithTextInCart(cart: CartState, textGuid: string) {
  return allViewsInCart(cart).find(
    (view) =>
      !!view.texts.find((text) => text.objectData.editorGuid === textGuid)
  );
}

export function findArtworkInCart(cart: CartState, guid: string) {
  return allArtworksInCart(cart).find(
    (artwork) => artwork.objectData.editorGuid === guid
  );
}

export function findTextInCart(cart: CartState, guid: string) {
  return allTextsInCart(cart).find(
    (text) => text.objectData.editorGuid === guid
  );
}

export function findLocationInProductData(
  data: PopulatedProductSettings,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views.flatMap((view) => view.locations))
    .find((location) => location.id === id);
}

export function findViewInProductData(
  data: PopulatedProductSettings,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views)
    .find((view) => view.id === id);
}

function allVariationsInCart(cart: CartState) {
  return cart.products.flatMap((product) => product.variations);
}

function allViewsInCart(cart: CartState) {
  return allVariationsInCart(cart).flatMap((variation) => variation.views);
}

function allArtworksInCart(cart: CartState) {
  return allViewsInCart(cart).flatMap((view) => view.artworks);
}

function allTextsInCart(cart: CartState) {
  return allViewsInCart(cart).flatMap((view) => view.texts);
}

export function getAdjacentViewId(
  productData: PopulatedProductSettings,
  selectedVariationId: number,
  selectedViewId: number,
  direction: "previous" | "next"
) {
  const variation = productData.variations.find(
    (variation) => variation.id === selectedVariationId
  );
  if (!variation)
    throw new Error(`Invalid variation id ${selectedVariationId} selected.`);

  const curIndex = variation.views.findIndex(
    (view) => view.id === selectedViewId
  );
  if (curIndex === -1)
    throw new Error(`Invalid view id ${selectedViewId} selected.`);

  const newIndex = wrap(
    direction === "previous" ? curIndex - 1 : curIndex + 1,
    0,
    variation.views.length - 1
  );
  const newView = variation.views[newIndex]!;

  return {
    viewId: newView.id,
  };
}
