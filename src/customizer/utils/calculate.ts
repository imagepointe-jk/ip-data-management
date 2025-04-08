import { CustomProductDecorationLocationNumeric } from "@/db/access/customizer";
import { TransformArgsPx } from "@/types/schema/customizer";
import { convertDesignerObjectData } from "./convert";
import { clamp } from "@/utility/misc";

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
