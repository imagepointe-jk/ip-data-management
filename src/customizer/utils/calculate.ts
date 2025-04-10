import { CustomProductDecorationLocationNumeric } from "@/db/access/customizer";
import { TransformNormalized } from "@/types/schema/customizer";
import { clamp } from "@/utility/misc";

export function calculateRectCenter(params: TransformNormalized) {
  const { positionNormalized, sizeNormalized, rotationDegrees } = params;

  const radians = ((rotationDegrees || 0) * Math.PI) / 180;
  return {
    x:
      positionNormalized.x +
      (sizeNormalized.x / 2) * Math.cos(radians) -
      (sizeNormalized.y / 2) * Math.sin(radians),
    y:
      positionNormalized.y +
      (sizeNormalized.x / 2) * Math.sin(radians) +
      (sizeNormalized.y / 2) * Math.cos(radians),
  };
}

export type ConstrainEditorObjectParams = {
  objectTransform: TransformNormalized;
  locations: CustomProductDecorationLocationNumeric[];
};
//tries to constrain the position and size of the given object inside the nearest decoration location
//TODO: This currently doesn't take rotation into account, and also sometimes causes snapping to undesired locations.
//TODO: Consider ranking the locations based on how much they overlap with the object (if at all). Overlap detection could be easily done by sampling a grid of points and seeing which are inside both A and B.
export function constrainEditorObjectTransform(
  params: ConstrainEditorObjectParams
) {
  const { locations, objectTransform } = params;

  //rank the locations by how close each one is to the given rect
  const sortedByDistToRect = [...locations];
  sortedByDistToRect.sort((locationA, locationB) => {
    const locationACenter = {
      x: locationA.positionX + locationA.width / 2,
      y: locationA.positionY + locationA.height / 2,
    };
    const locationBCenter = {
      x: locationB.positionX + locationB.width / 2,
      y: locationB.positionY + locationB.height / 2,
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

  const closestLocationBottomRightCorner = {
    x: closestLocation.positionX + closestLocation.width,
    y: closestLocation.positionY + closestLocation.height,
  };

  //now that we have the closest location, figure out the bounds it gives us
  const topLeftBounds = {
    x: closestLocation.positionX,
    y: closestLocation.positionY,
  };
  const bottomRightBounds = {
    x: clamp(
      closestLocationBottomRightCorner.x - objectTransform.sizeNormalized.x,
      topLeftBounds.x,
      Infinity
    ),
    y: clamp(
      closestLocationBottomRightCorner.y - objectTransform.sizeNormalized.y,
      topLeftBounds.y,
      Infinity
    ),
  };

  //then clamp the object within those bounds
  const clampedX = clamp(
    objectTransform.positionNormalized.x,
    topLeftBounds.x,
    bottomRightBounds.x
  );
  const clampedY = clamp(
    objectTransform.positionNormalized.y,
    topLeftBounds.y,
    bottomRightBounds.y
  );
  const clampedWidth = clamp(
    objectTransform.sizeNormalized.x,
    0.05,
    closestLocation.width
  );
  const clampedHeight = clamp(
    objectTransform.sizeNormalized.y,
    0.05,
    closestLocation.height
  );

  return {
    constrainedPosition: {
      x: clampedX,
      y: clampedY,
    },
    constrainedSize: {
      x: clampedWidth,
      y: clampedHeight,
    },
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
