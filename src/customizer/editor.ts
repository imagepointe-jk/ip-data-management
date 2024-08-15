import { CustomProductDecorationLocationNumeric } from "@/db/access/customizer";
import { PlacedObject } from "@/types/customizer";

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
  objectData: PlacedObject
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
