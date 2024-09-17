import { convertDesignerObjectData } from "@/customizer/utils";
import { EditorImage } from "./EditorImage";
import { editorSize } from "../ProductView";
import { CartStateProductLocation } from "@/types/schema/customizer";
import { Text } from "react-konva";

type Props = {
  locationInState: CartStateProductLocation;
  locationSize: {
    x: number;
    y: number;
  };
  locationPosition: {
    x: number;
    y: number;
  };
};
export function RenderedLocation({
  locationInState,
  locationSize,
  locationPosition,
}: Props) {
  return (
    <>
      {locationInState.artworks.map((art) => {
        const { position, size } = convertDesignerObjectData(
          editorSize,
          editorSize,
          art.objectData
        );
        return (
          <EditorImage
            key={art.objectData.editorGuid}
            editorGuid={art.objectData.editorGuid}
            src={art.imageUrl}
            x={position.x}
            y={position.y}
            width={size.x}
            height={size.y}
            rotationDeg={art.objectData.rotationDegrees}
            limits={{
              size: {
                min: {
                  width: 50,
                  height: 50,
                },
                max: {
                  width: locationSize.x,
                  height: locationSize.y,
                },
              },
              boundingRect: {
                topLeft: {
                  x: locationPosition.x,
                  y: locationPosition.y,
                },
                bottomRight: {
                  x: locationPosition.x + locationSize.x,
                  y: locationPosition.y + locationSize.y,
                },
              },
            }}
          />
        );
      })}
      {locationInState.texts.map((text) => {
        const { position, size } = convertDesignerObjectData(
          editorSize,
          editorSize,
          text.objectData
        );
        return (
          <Text
            key={text.objectData.editorGuid}
            text={text.text}
            x={position.x}
            y={position.y}
            width={size.x}
            fontSize={20}
            fill={text.style?.hexCode}
            align={text.style?.align}
            fontStyle={text.style?.fontStyle}
            strokeWidth={text.style?.strokeWidth}
            textDecoration={text.style?.textDecoration}
            stroke={text.style?.strokeHexCode}
            rotationDeg={text.objectData.rotationDegrees}
          />
        );
      })}
    </>
  );
}
