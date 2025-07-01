//any other geometry-related utility functions should be moved here

import { clamp } from "./misc";

type Rect = {
  position: {
    x: number;
    y: number;
  };
  size: {
    x: number;
    y: number;
  };
};
//snaps both the size and position of a rectangle to one of the given bounding rectangles. picks the smallest possible translation.
//does not take rotation into account, but this could be worked around by using the AABB of the rotated rect instead.
export function snapToNearest(targetRect: Rect, allBounds: Rect[]) {
  const targetRectCenter = {
    x: targetRect.position.x + targetRect.size.x * 0.5,
    y: targetRect.position.y + targetRect.size.y * 0.5,
  };
  //first determine what snaps we COULD do
  const snapOptions = allBounds.map((bounds) =>
    snapToBounds(targetRect, bounds)
  );
  //sort them by their distance to the original rect
  const sortedOptions = snapOptions.sort((a, b) => {
    const centerA = {
      x: a.position.x + a.size.x * 0.5,
      y: a.position.y + a.size.y * 0.5,
    };
    const centerB = {
      x: b.position.x + b.size.x * 0.5,
      y: b.position.y + b.size.y * 0.5,
    };
    const distToA = Math.sqrt(
      Math.pow(targetRectCenter.x - centerA.x, 2) +
        Math.pow(targetRectCenter.y - centerA.y, 2)
    );
    const distToB = Math.sqrt(
      Math.pow(targetRectCenter.x - centerB.x, 2) +
        Math.pow(targetRectCenter.y - centerB.y, 2)
    );
    return distToA - distToB;
  });
  //prefer the snap with minimal movement from the starting position
  const lowest = sortedOptions[0];
  return lowest || targetRect;
}

function snapToBounds(targetRect: Rect, bounds: Rect) {
  const scaleConstrained = constrainRectScale(targetRect, bounds);
  return constrainRectPosition(scaleConstrained, bounds);
}

function constrainRectScale(targetRect: Rect, bounds: Rect): Rect {
  const widthFactor = bounds.size.x / targetRect.size.x;
  const heightFactor = bounds.size.y / targetRect.size.y;
  if (widthFactor >= 1 && heightFactor >= 1) return targetRect;

  const scaleFactor = widthFactor < heightFactor ? widthFactor : heightFactor;
  return {
    position: targetRect.position,
    size: {
      x: targetRect.size.x * scaleFactor,
      y: targetRect.size.y * scaleFactor,
    },
  };
}

function constrainRectPosition(targetRect: Rect, bounds: Rect) {
  const constrained: Rect = {
    position: {
      x: targetRect.position.x,
      y: targetRect.position.y,
    },
    size: {
      x: targetRect.size.x,
      y: targetRect.size.y,
    },
  };

  constrained.position.x = clamp(
    constrained.position.x,
    bounds.position.x,
    Infinity
  );
  constrained.position.y = clamp(
    constrained.position.y,
    bounds.position.y,
    Infinity
  );

  const boundsRightEdge = bounds.position.x + bounds.size.x;
  const boundsBottomEdge = bounds.position.y + bounds.size.y;
  const targetRectRightEdge = targetRect.position.x + targetRect.size.x;
  const targetRectBottomEdge = targetRect.position.y + targetRect.size.y;

  constrained.position.x += clamp(
    boundsRightEdge - targetRectRightEdge,
    Number.NEGATIVE_INFINITY,
    0
  );
  constrained.position.y += clamp(
    boundsBottomEdge - targetRectBottomEdge,
    Number.NEGATIVE_INFINITY,
    0
  );

  return constrained;
}
