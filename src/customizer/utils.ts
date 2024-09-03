import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import {
  CartState,
  CartStateProductLocation,
  CartStateProductVariation,
  CartStateProductView,
  TransformArgsPx,
} from "@/types/schema/customizer";
import { FullProductSettingsSerializable } from "./redux/slices/productData";
import { DesignResults } from "@/types/schema/designs";
import {
  DesignResultsSerializable,
  DesignWithIncludesSerializable,
} from "./redux/slices/designData";

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

//PlacedObject data includes position and size values in the range 0-1.
//Convert these to display them correctly in the front end relative to the editing area.
export function convertDesignerObjectData(
  viewWidth: number,
  viewHeight: number,
  objectData: {
    positionNormalized: { x: number; y: number };
    sizeNormalized: { x: number; y: number };
  }
) {
  const { positionNormalized, sizeNormalized } = objectData;
  return {
    position: {
      x: positionNormalized.x * viewWidth,
      y: positionNormalized.y * viewHeight,
    },
    size: {
      x: sizeNormalized.x * viewWidth,
      y: sizeNormalized.y * viewHeight,
    },
  };
}

//TransformArgs coming from Konva transform/drag events have absolute px values.
//convert to 0-1 range for storage in PlacedObject state.
export function convertTransformArgs(
  viewWidth: number,
  viewHeight: number,
  transform: TransformArgsPx
) {
  const { xPx, yPx, widthPx, heightPx } = transform;
  return {
    xNormalized: xPx ? xPx / viewWidth : undefined,
    yNormalized: yPx ? yPx / viewHeight : undefined,
    widthNormalized: widthPx ? widthPx / viewWidth : undefined,
    heightNormalized: heightPx ? heightPx / viewHeight : undefined,
  };
}

export function calculateObjectPositionLimits(params: {
  object: { width: number; height: number };
  boundingRect?: {
    topLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
}): { min: { x: number; y: number }; max: { x: number; y: number } } {
  const { object, boundingRect } = params;

  if (!boundingRect)
    return {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: Infinity,
        y: Infinity,
      },
    };

  const boundsWidth = boundingRect.bottomRight.x - boundingRect.topLeft.x;
  const boundsHeight = boundingRect.bottomRight.y - boundingRect.topLeft.y;

  return {
    min: {
      x: boundingRect.topLeft.x,
      y: boundingRect.topLeft.y,
    },
    max: {
      x: boundingRect.topLeft.x + boundsWidth - object.width,
      y: boundingRect.topLeft.y + boundsHeight - object.height,
    },
  };
}

export function createInitialState(products: FullProductSettings[]) {
  //this becomes the first product added to the user's cart
  //currently this just picks the first one from our customizer db
  //will eventually need to be whatever id was specified in the URL
  const firstProduct = products[0];
  if (!firstProduct) throw new Error("No products");

  const firstVariation = firstProduct.variations[0];
  if (!firstVariation) throw new Error("No variations");

  const firstView = firstVariation.views[0];
  if (!firstView) throw new Error("No views");

  const firstLocation = firstView.locations[0];
  if (!firstLocation) throw new Error("No locations");

  const initialLocation: CartStateProductLocation = {
    id: firstLocation.id,
    artworks: [],
  };
  const initialView: CartStateProductView = {
    id: firstView.id,
    locations: [initialLocation],
  };
  const initialVariation: CartStateProductVariation = {
    id: firstVariation.id,
    views: [initialView],
  };

  const initialDesignState: CartState = {
    products: [
      {
        id: firstProduct.id,
        variations: [
          {
            id: firstVariation.id,
            views: firstVariation.views.map((view) => ({
              id: view.id,
              locations: view.locations.map((location) => ({
                id: location.id,
                artworks: [],
              })),
            })),
          },
        ],
      },
    ],
  };

  return {
    initialDesignState,
    initialProduct: firstProduct,
    initialVariation,
    initialView,
    initialLocation,
  };
}

function allVariationsInCart(cart: CartState) {
  return cart.products.flatMap((product) => product.variations);
}

function allViewsInCart(cart: CartState) {
  return allVariationsInCart(cart).flatMap((variation) => variation.views);
}

function allLocationsInCart(cart: CartState) {
  return allViewsInCart(cart).flatMap((view) => view.locations);
}

function allArtworksInCart(cart: CartState) {
  return allLocationsInCart(cart).flatMap((location) => location.artworks);
}

export function findVariationInCart(cart: CartState, id: number) {
  return allVariationsInCart(cart).find((variation) => variation.id === id);
}

export function findViewInCart(cart: CartState, id: number) {
  return allViewsInCart(cart).find((location) => location.id === id);
}

export function findLocationWithArtworkInCart(
  cart: CartState,
  artworkGuid: string
) {
  return allLocationsInCart(cart).find(
    (location) =>
      !!location.artworks.find(
        (artwork) => artwork.objectData.editorGuid === artworkGuid
      )
  );
}

export function findArtworkInCart(cart: CartState, guid: string) {
  return allArtworksInCart(cart).find(
    (artwork) => artwork.objectData.editorGuid === guid
  );
}

export function findLocationInCart(cart: CartState, id: number) {
  return allLocationsInCart(cart).find((location) => location.id === id);
}

//each variation counts as a separate cart item, so count the total variations of all products combined
export function countCartItems(cart: CartState) {
  return cart.products.flatMap((product) => product.variations).length;
}

export function findLocationInProductData(
  data: FullProductSettingsSerializable,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views.flatMap((view) => view.locations))
    .find((location) => location.id === id);
}

export function findViewInProductData(
  data: FullProductSettingsSerializable,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views)
    .find((view) => view.id === id);
}

export function makeProductDataSerializable(
  data: FullProductSettings[]
): FullProductSettingsSerializable[] {
  return data.map((item) => {
    const newData: FullProductSettingsSerializable = {
      ...item,
      createdAt: "",
      updatedAt: "",
      //the Date object in the original type causes problems with Redux, and it's not needed for the customizer
    };
    return newData;
  });
}

export function makeDesignResultsSerializable(
  data: DesignResults
): DesignResultsSerializable {
  const newData: DesignResultsSerializable = {
    ...data,
    designs: data.designs.map((design) => {
      const serializable: DesignWithIncludesSerializable = {
        ...design,
        date: "",
      };
      return serializable;
    }),
  };
  return newData;
}
