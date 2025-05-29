import { Rect } from "react-konva";
import { productEditorSize } from "@/constants";
import { normalizedTransformToPixels } from "@/customizer/utils/convert";

type Props = {
  locations: {
    id: number;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    frameColor: string;
  }[];
};
export function LocationFrames({ locations }: Props) {
  return (
    <>
      {locations.map((location) => {
        const { position, size } = normalizedTransformToPixels(
          productEditorSize,
          productEditorSize,
          {
            positionNormalized: {
              x: location.positionX || 0,
              y: location.positionY || 0,
            },
            sizeNormalized: {
              x: location.width || 0,
              y: location.height || 0,
            },
          }
        );

        return (
          <Rect
            key={location.id}
            x={position.x}
            y={position.y}
            width={size.x}
            height={size.y}
            stroke={`#${location.frameColor}`}
            strokeWidth={4}
            opacity={0.5}
          />
        );
      })}
    </>
  );
}
