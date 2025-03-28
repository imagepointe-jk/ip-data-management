import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import {
  CartState,
  CartStateProductLocation,
  CartStateProductVariation,
  CartStateProductView,
  PlacedObject,
  PopulatedProductSettings,
  PopulatedProductSettingsSerializable,
  TransformArgsPx,
} from "@/types/schema/customizer";
import { DesignResults } from "@/types/schema/designs";
import {
  DesignResultsSerializable,
  DesignWithIncludesSerializable,
} from "./redux/slices/designData";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import Konva from "konva";
import { clamp } from "@/utility/misc";

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
    // locations: [initialLocation],
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
              // locations: view.locations.map((location) => ({
              //   id: location.id,
              //   artworks: [],
              //   texts: [],
              // })),
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

function allVariationsInCart(cart: CartState) {
  return cart.products.flatMap((product) => product.variations);
}

function allViewsInCart(cart: CartState) {
  return allVariationsInCart(cart).flatMap((variation) => variation.views);
}

// function allLocationsInCart(cart: CartState) {
//   return allViewsInCart(cart).flatMap((view) => view.locations);
// }

function allArtworksInCart(cart: CartState) {
  return allViewsInCart(cart).flatMap((view) => view.artworks);
  // return allLocationsInCart(cart).flatMap((location) => location.artworks);
}

function allTextsInCart(cart: CartState) {
  return allViewsInCart(cart).flatMap((view) => view.texts);
  // return allLocationsInCart(cart).flatMap((location) => location.texts);
}

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

// export function findLocationWithArtworkInCart(
//   cart: CartState,
//   artworkGuid: string
// ) {
//   return allLocationsInCart(cart).find(
//     (location) =>
//       !!location.artworks.find(
//         (artwork) => artwork.objectData.editorGuid === artworkGuid
//       )
//   );
// }

export function findViewWithTextInCart(cart: CartState, textGuid: string) {
  return allViewsInCart(cart).find(
    (view) =>
      !!view.texts.find((text) => text.objectData.editorGuid === textGuid)
  );
}
// export function findLocationWithTextInCart(cart: CartState, textGuid: string) {
//   return allLocationsInCart(cart).find(
//     (location) =>
//       !!location.texts.find((text) => text.objectData.editorGuid === textGuid)
//   );
// }

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

// export function findLocationInCart(cart: CartState, id: number) {
//   return allLocationsInCart(cart).find((location) => location.id === id);
// }

//each variation is treated as a separate cart item, so count the total variations of all products combined
export function countCartItems(cart: CartState) {
  return cart.products.flatMap((product) => product.variations).length;
}

export function findLocationInProductData(
  data: PopulatedProductSettingsSerializable,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views.flatMap((view) => view.locations))
    .find((location) => location.id === id);
}

export function findViewInProductData(
  data: PopulatedProductSettingsSerializable,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views)
    .find((view) => view.id === id);
}

export function makeProductDataSerializable(
  data: PopulatedProductSettings[]
): PopulatedProductSettingsSerializable[] {
  return data.map((item) => {
    const newData: PopulatedProductSettingsSerializable = {
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

export function getCurrentViewDataURL() {
  const stage = Konva.stages[0];
  if (!stage) throw new Error("No Konva stage");
  return stage.toDataURL({ mimeType: "image/jpeg", quality: 1 });
}

export function calculateRectCenter(params: TransformArgsPx) {
  const { xPx, yPx, widthPx, heightPx, rotationDegrees } = params;

  const topLeftX = xPx || 0;
  const topLeftY = yPx || 0;
  const width = widthPx || 0;
  const height = heightPx || 0;

  const radians = ((rotationDegrees || 0) * Math.PI) / 180;
  return {
    x:
      topLeftX +
      (width / 2) * Math.cos(radians) -
      (height / 2) * Math.sin(radians),
    y:
      topLeftY +
      (width / 2) * Math.sin(radians) +
      (height / 2) * Math.cos(radians),
  };
}

export type ConstrainObjectEditorParams = {
  productEditorSize: number;
  objectTransform: TransformArgsPx;
  locations: CustomProductDecorationLocationNumeric[];
};
//tries to constrain the position and size of the given object inside the nearest decoration location
//TODO: This currently doesn't take rotation into account, and also sometimes causes snapping to undesired locations.
//TODO: Consider ranking the locations based on how much they overlap with the object (if at all). Overlap detection could be easily done by sampling a grid of points and seeing which are inside both A and B.
export function constrainEditorObjectTransform(
  params: ConstrainObjectEditorParams
) {
  const { locations, objectTransform, productEditorSize } = params;

  //rank the locations by how close each one is to the given rect
  const sortedByDistToRect = [...locations];
  sortedByDistToRect.sort((locationA, locationB) => {
    const { position: locationAPositionPx, size: locationASizePx } =
      convertDesignerObjectData(productEditorSize, productEditorSize, {
        positionNormalized: {
          x: locationA.positionX,
          y: locationA.positionY,
        },
        sizeNormalized: {
          x: locationA.width,
          y: locationA.height,
        },
      });
    const { position: locationBPositionPx, size: locationBSizePx } =
      convertDesignerObjectData(productEditorSize, productEditorSize, {
        positionNormalized: {
          x: locationB.positionX,
          y: locationB.positionY,
        },
        sizeNormalized: {
          x: locationB.width,
          y: locationB.height,
        },
      });
    const locationACenter = {
      x: locationAPositionPx.x + locationASizePx.x / 2,
      y: locationAPositionPx.y + locationASizePx.y / 2,
    };
    const locationBCenter = {
      x: locationBPositionPx.x + locationBSizePx.x / 2,
      y: locationBPositionPx.y + locationBSizePx.y / 2,
    };
    const rectCenter = calculateRectCenter(objectTransform);

    const x1 = rectCenter.x;
    const y1 = rectCenter.y;
    const x2 = locationACenter.x;
    const y2 = locationACenter.y;
    const x3 = locationBCenter.x;
    const y3 = locationBCenter.y;

    const rectDistanceToLocationA = Math.sqrt(
      Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
    );
    const rectDistanceToLocationB = Math.sqrt(
      Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2)
    );

    return rectDistanceToLocationA - rectDistanceToLocationB;
  });

  const closestLocation = sortedByDistToRect[0];
  if (!closestLocation) throw new Error("No location to snap to");

  const { position: closestLocationPositionPx, size: closestLocationSizePx } =
    convertDesignerObjectData(productEditorSize, productEditorSize, {
      positionNormalized: {
        x: closestLocation.positionX,
        y: closestLocation.positionY,
      },
      sizeNormalized: {
        x: closestLocation.width,
        y: closestLocation.height,
      },
    });
  const closestLocationBottomRightCorner = {
    x: closestLocationPositionPx.x + closestLocationSizePx.x,
    y: closestLocationPositionPx.y + closestLocationSizePx.y,
  };

  //now that we have the closest location, figure out the bounds it gives us
  const topLeftBounds = {
    x: closestLocationPositionPx.x,
    y: closestLocationPositionPx.y,
  };
  const bottomRightBounds = {
    x: clamp(
      closestLocationBottomRightCorner.x - (objectTransform.widthPx || 0),
      topLeftBounds.x,
      Infinity
    ),
    y: clamp(
      closestLocationBottomRightCorner.y - (objectTransform.heightPx || 0),
      topLeftBounds.y,
      Infinity
    ),
  };

  //then clamp the object within those bounds
  const clampedX = clamp(
    objectTransform.xPx || 0,
    topLeftBounds.x,
    bottomRightBounds.x
  );
  const clampedY = clamp(
    objectTransform.yPx || 0,
    topLeftBounds.y,
    bottomRightBounds.y
  );
  const clampedWidth = clamp(
    objectTransform.widthPx || 0,
    30,
    closestLocationSizePx.x
  );
  const clampedHeight = clamp(
    objectTransform.heightPx || 0,
    30,
    closestLocationSizePx.y
  );

  return {
    constrainedPosition: {
      x: clampedX,
      y: clampedY,
    },
    constrainedSize: {
      width: clampedWidth,
      height: clampedHeight,
    },
  };
}
