import { DesignState } from "@/app/customizer/EditorContext";
import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import { TransformArgs } from "@/types/customizer";

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

export function createInitialState(products: FullProductSettings[]) {
  const initialProduct = products[0];
  if (!initialProduct) throw new Error("No initial product");

  const initialVariation = initialProduct.variations[0];
  if (!initialVariation) throw new Error("No initial variation");

  const initialView = initialVariation.views[0];
  if (!initialView) throw new Error("No initial view");

  const initialLocation = initialView.locations[0];
  if (!initialLocation) throw new Error("No initial location");

  const initialDesignState: DesignState = {
    products: [
      {
        id: initialProduct.id,
        variations: [
          {
            id: initialVariation.id,
            views: [
              {
                id: initialView.id,
                locations: [
                  {
                    id: initialLocation.id,
                    artworks: [],
                  },
                ],
              },
            ],
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
