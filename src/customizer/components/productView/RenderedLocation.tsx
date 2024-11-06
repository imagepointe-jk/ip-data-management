import { convertDesignerObjectData } from "@/customizer/utils";
import { CartStateProductLocation } from "@/types/schema/customizer";
import { EditorObject } from "./EditorObject";
import { productEditorSize } from "@/constants";

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
          productEditorSize,
          productEditorSize,
          art.objectData
        );
        return (
          <EditorObject
            key={art.objectData.editorGuid}
            editorGuid={art.objectData.editorGuid}
            imageData={{ src: art.imageUrl }}
            x={position.x}
            y={position.y}
            width={size.x}
            height={size.y}
            rotationDeg={art.objectData.rotationDegrees}
            limits={createObjectLimits(
              {
                x: locationSize.x,
                y: locationSize.y,
              },
              { x: locationPosition.x, y: locationPosition.y }
            )}
          />
        );
      })}
      {locationInState.texts.map((text) => {
        const { position, size } = convertDesignerObjectData(
          productEditorSize,
          productEditorSize,
          text.objectData
        );
        return (
          <EditorObject
            key={text.objectData.editorGuid}
            editorGuid={text.objectData.editorGuid}
            x={position.x}
            y={position.y}
            width={size.x}
            rotationDeg={text.objectData.rotationDegrees}
            textData={text.textData}
            limits={createObjectLimits(
              {
                x: locationSize.x,
                y: locationSize.y,
              },
              { x: locationPosition.x, y: locationPosition.y }
            )}
          />
        );
      })}
    </>
  );
}

function createObjectLimits(
  locationSize: {
    x: number;
    y: number;
  },
  locationPosition: {
    x: number;
    y: number;
  }
) {
  return {
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
  };
}
