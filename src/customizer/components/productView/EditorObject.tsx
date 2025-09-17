import { IMAGE_NOT_FOUND_URL, productEditorSize } from "@/constants";
import useImage from "use-image";
import { Transformable } from "./Transformable";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { useDispatch } from "react-redux";
import {
  setDialogOpen,
  setSelectedEditorGuid,
} from "@/customizer/redux/slices/editor";
import { Image, Text } from "react-konva";
import { EditorTextData, TransformArgsPx } from "@/types/schema/customizer";
import {
  normalizedTransformToPixels,
  pixelTransformToNormalized,
} from "@/customizer/utils/convert";
import { snapToNearest } from "@/utility/geometry";
import { DecorationLocationDTO } from "@/types/dto/customizer";

type Props = {
  editorGuid: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotationDeg: number;
  textData?: EditorTextData;
  imageData?: {
    src: string;
  };
  locations: DecorationLocationDTO[];
  setShowLocationFrames: (b: boolean) => void;
};
export function EditorObject({
  editorGuid,
  width,
  height,
  x,
  y,
  rotationDeg,
  textData,
  imageData,
  locations,
  setShowLocationFrames,
}: Props) {
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const dispatch = useDispatch();
  const [image] = useImage(imageData?.src || IMAGE_NOT_FOUND_URL);
  if (image) image.crossOrigin = "Anonymous"; //without this, CORS will cause a "tainted canvas" error when trying to export the canvas

  if (!textData && !imageData)
    throw new Error("EditorObject has no image data or text data!");

  function onClick(isText?: boolean) {
    dispatch(setSelectedEditorGuid(editorGuid));
    if (isText) dispatch(setDialogOpen("text"));
  }

  function constrainTransform(params: TransformArgsPx) {
    //convert to normalized for constraint calculation
    const { positionNormalized, sizeNormalized } = pixelTransformToNormalized(
      productEditorSize,
      productEditorSize,
      params
    );
    //do the constraint calculation
    const snapped = snapToNearest(
      {
        position: { x: positionNormalized.x, y: positionNormalized.y },
        size: { x: sizeNormalized.x, y: sizeNormalized.y },
      },
      locations.map((location) => ({
        position: { x: location.positionX, y: location.positionY },
        size: { x: location.width, y: location.height },
      }))
    );
    //convert back to px to get values suitable for setting transform
    const { position: positionPx, size: sizePx } = normalizedTransformToPixels(
      productEditorSize,
      productEditorSize,
      {
        positionNormalized: snapped.position,
        sizeNormalized: snapped.size,
      }
    );
    return {
      constrainedPosition: positionPx,
      constrainedSize: sizePx,
    };
  }

  return (
    <Transformable
      selected={editorGuid === selectedEditorGuid}
      onDragStart={() => setShowLocationFrames(true)}
      onDragEnd={() => setShowLocationFrames(false)}
      onTransformStart={() => setShowLocationFrames(true)}
      onTransformEnd={() => setShowLocationFrames(false)}
      constrainTransform={constrainTransform}
    >
      {textData && (
        <Text
          onMouseDown={() => onClick(true)}
          key={editorGuid}
          text={textData.text}
          x={x}
          y={y}
          width={width}
          fontSize={textData.style?.fontSize}
          fill={textData.style?.hexCode}
          align={textData.style?.align}
          fontStyle={textData.style?.fontStyle || undefined}
          fontFamily={textData.style?.fontFamily}
          strokeWidth={textData.style?.strokeWidth || undefined}
          textDecoration={textData.style?.textDecoration || undefined}
          stroke={textData.style?.strokeHexCode || undefined}
          rotationDeg={rotationDeg}
        />
      )}
      {imageData && (
        <Image
          onMouseDown={() => onClick()}
          image={image}
          width={width}
          height={height}
          x={x}
          y={y}
          rotation={rotationDeg}
        />
      )}
    </Transformable>
  );
}
