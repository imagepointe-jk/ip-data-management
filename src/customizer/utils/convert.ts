import {
  PopulatedProductSettings,
  PopulatedProductSettingsSerializable,
  TransformArgsPx,
  TransformArgsPxOptional,
} from "@/types/schema/customizer";
import { DesignResults } from "@/types/schema/designs";
import {
  DesignResultsSerializable,
  DesignWithIncludesSerializable,
} from "../redux/slices/designData";

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
//PlacedObject data includes position and size values in the range 0-1.
//Convert these to display them correctly in the front end relative to the editing area.
export function normalizedTransformToPixels(
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
export function pixelTransformToNormalized(
  viewWidth: number,
  viewHeight: number,
  transform: TransformArgsPx
) {
  const { xPx, yPx, widthPx, heightPx } = transform;
  return {
    positionNormalized: {
      x: xPx / viewWidth,
      y: yPx / viewHeight,
    },
    sizeNormalized: {
      x: widthPx / viewWidth,
      y: heightPx / viewHeight,
    },
  };
}
