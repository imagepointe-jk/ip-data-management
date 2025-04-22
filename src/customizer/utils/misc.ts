import { IMAGE_NOT_FOUND_URL } from "@/constants";
import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import {
  CartState,
  CartStateProductLocation,
  CartStateProductVariation,
  CartStateProductView,
} from "@/types/schema/customizer";
import Konva from "konva";

export function createLocationFrameInlineStyles(
  location: CustomProductDecorationLocationNumeric
) {
  return {
    width: `${location.width * 100}%`,
    height: `${location.height * 100}%`,
    left: `${location.positionX * 100}%`,
    top: `${location.positionY * 100}%`,
    borderColor: `#${location.frameColor}`,
  };
}

export function createInitialState(
  products: FullProductSettings[],
  initialProductId: number,
  initialVariationId: number
) {
  //this becomes the first product added to the user's cart
  //currently this just picks the first one from our customizer db
  //will eventually need to be whatever id was specified in the URL
  const initialProduct = products.find(
    (product) => product.wooCommerceId === initialProductId
  );
  if (!initialProduct) throw new Error("No initial product");

  const initialVariation = initialProduct.variations.find(
    (variation) => variation.id === initialVariationId
  );
  if (!initialVariation) throw new Error("No initial variation");

  const firstView = initialVariation.views[0];
  if (!firstView) throw new Error("No views");

  const firstLocation = firstView.locations[0];
  if (!firstLocation) throw new Error("No locations");

  const initialLocation: CartStateProductLocation = {
    id: firstLocation.id,
    artworks: [],
    texts: [],
  };
  const initialView: CartStateProductView = {
    id: firstView.id,
    artworks: [],
    texts: [],
    currentRenderUrl: IMAGE_NOT_FOUND_URL,
  };
  const initialVariationState: CartStateProductVariation = {
    id: initialVariation.id,
    views: [initialView],
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

  const initialDesignState: CartState = {
    products: [
      {
        id: initialProduct.id,
        variations: [
          {
            id: initialVariation.id,
            views: initialVariation.views.map((view) => ({
              id: view.id,
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
          },
        ],
      },
    ],
  };

  return {
    initialDesignState,
    initialProduct,
    initialVariation: initialVariationState,
    initialView,
    initialLocation,
  };
}

//each variation is treated as a separate cart item, so count the total variations of all products combined
export function countCartItems(cart: CartState) {
  return cart.products.flatMap((product) => product.variations).length;
}

export function getCurrentViewDataURL() {
  const stage = Konva.stages[0];
  if (!stage) throw new Error("No Konva stage");
  return stage.toDataURL({ mimeType: "image/jpeg", quality: 1 });
}
