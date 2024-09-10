import { convertDesignerObjectData } from "@/customizer/utils";
import { EditorImage } from "./EditorImage";
import { editorSize } from "../ProductView";
import { CartStateProductLocation } from "@/types/schema/customizer";

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
export function LocationWithArtworks({
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
    </>
  );
}
