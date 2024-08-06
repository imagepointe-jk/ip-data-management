import { CustomProductDecorationLocation } from "@prisma/client";

export function createLocationFrameInlineStyles(location: {
  width: string;
  height: string;
  positionX: string;
  positionY: string;
}) {
  return {
    width: `${+location.width * 100}%`,
    height: `${+location.height * 100}%`,
    left: `${+location.positionX * 100}%`,
    top: `${+location.positionY * 100}%`,
  };
}
