import { IMAGE_NOT_FOUND_URL } from "@/constants";
import useImage from "use-image";
import { Transformable, TransformLimits } from "./Transformable";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { useDispatch } from "react-redux";
import {
  setDialogOpen,
  setSelectedEditorGuid,
} from "@/customizer/redux/slices/editor";
import { Image, Text } from "react-konva";
import { EditorTextData } from "@/types/schema/customizer";

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
  limits?: TransformLimits;
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
  limits,
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

  return (
    <Transformable selected={editorGuid === selectedEditorGuid} limits={limits}>
      {textData && (
        <Text
          onClick={() => onClick(true)}
          key={editorGuid}
          text={textData.text}
          x={x}
          y={y}
          width={width}
          fontSize={textData.style?.fontSize}
          fill={textData.style?.hexCode}
          align={textData.style?.align}
          fontStyle={textData.style?.fontStyle || undefined}
          strokeWidth={textData.style?.strokeWidth || undefined}
          textDecoration={textData.style?.textDecoration || undefined}
          stroke={textData.style?.strokeHexCode || undefined}
          rotationDeg={rotationDeg}
        />
      )}
      {imageData && (
        <Image
          onClick={() => onClick()}
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
