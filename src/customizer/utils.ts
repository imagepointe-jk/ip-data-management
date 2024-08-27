import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import {
  DesignState,
  DesignStateLocation,
  DesignStateVariation,
  DesignStateView,
  TransformArgs,
} from "@/types/customizer";

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
    position: { x: number; y: number };
    size: { x: number; y: number };
  }
) {
  const { position, size } = objectData;
  return {
    position: {
      x: position.x * viewWidth,
      y: position.y * viewHeight,
    },
    size: {
      x: size.x * viewWidth,
      y: size.y * viewHeight,
    },
  };
}

//TransformArgs coming from Konva transform/drag events have absolute px values.
//convert to 0-1 range for storage in PlacedObject state.
export function convertTransformArgs(
  viewWidth: number,
  viewHeight: number,
  transform: TransformArgs
) {
  const { x, y, width, height } = transform;
  return {
    x: x ? x / viewWidth : undefined,
    y: y ? y / viewHeight : undefined,
    width: width ? width / viewWidth : undefined,
    height: height ? height / viewHeight : undefined,
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
  const firstProduct = products[0];
  if (!firstProduct) throw new Error("No products");

  const firstVariation = firstProduct.variations[0];
  if (!firstVariation) throw new Error("No variations");

  const firstView = firstVariation.views[0];
  if (!firstView) throw new Error("No views");

  const firstLocation = firstView.locations[0];
  if (!firstLocation) throw new Error("No locations");

  const initialLocation: DesignStateLocation = {
    id: firstLocation.id,
    artworks: [],
  };
  const initialView: DesignStateView = {
    id: firstView.id,
    locations: [initialLocation],
  };
  const initialVariation: DesignStateVariation = {
    id: firstVariation.id,
    views: [initialView],
  };

  const initialDesignState: DesignState = {
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
    initialVariation,
    initialView,
    initialLocation,
  };
}

function allVariations(state: DesignState) {
  return state.products.flatMap((product) => product.variations);
}

function allViews(state: DesignState) {
  return allVariations(state).flatMap((variation) => variation.views);
}

function allLocations(state: DesignState) {
  return allViews(state).flatMap((view) => view.locations);
}

function allArtworks(state: DesignState) {
  return allLocations(state).flatMap((location) => location.artworks);
}

export function findVariationInState(state: DesignState, id: number) {
  return allVariations(state).find((variation) => variation.id === id);
}

export function findViewInState(state: DesignState, id: number) {
  return allViews(state).find((location) => location.id === id);
}

export function findLocationWithArtworkInState(
  state: DesignState,
  artworkGuid: string
) {
  return allLocations(state).find(
    (location) =>
      !!location.artworks.find(
        (artwork) => artwork.objectData.editorGuid === artworkGuid
      )
  );
}

export function findArtworkInState(state: DesignState, guid: string) {
  return allArtworks(state).find(
    (artwork) => artwork.objectData.editorGuid === guid
  );
}

export function findLocationInState(state: DesignState, id: number) {
  return allLocations(state).find((location) => location.id === id);
}

export function findLocationInProductData(
  data: FullProductSettings,
  id: number
) {
  return data.variations
    .flatMap((variation) => variation.views.flatMap((view) => view.locations))
    .find((location) => location.id === id);
}

export function findViewInProductData(data: FullProductSettings, id: number) {
  return data.variations
    .flatMap((variation) => variation.views)
    .find((view) => view.id === id);
}
