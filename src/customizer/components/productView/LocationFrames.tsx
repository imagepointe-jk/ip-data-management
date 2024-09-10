import { convertDesignerObjectData } from "@/customizer/utils";
import { editorSize } from "../ProductView";
import { Rect } from "react-konva";
import { useDispatch } from "react-redux";
import {
  setSelectedEditorGuid,
  setSelectedLocationId,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";

type Props = {
  locations: {
    id: number;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
  }[];
};
export function LocationFrames({ locations }: Props) {
  const dispatch = useDispatch();
  const { selectedLocation } = useEditorSelectors();

  return (
    <>
      {locations.map((location) => {
        const { position, size } = convertDesignerObjectData(
          editorSize,
          editorSize,
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
            stroke={"gray"}
            strokeWidth={4}
            opacity={selectedLocation.id === location.id ? 1 : 0.3}
            onClick={() => {
              dispatch(setSelectedLocationId(location.id));
              dispatch(setSelectedEditorGuid(null));
            }}
          />
        );
      })}
    </>
  );
}
