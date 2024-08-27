import { IMAGE_NOT_FOUND_URL } from "@/constants";
import useImage from "use-image";
import { Transformable, TransformLimits } from "./Transformable";
import { Image } from "react-konva";
import { useEditor } from "../../EditorContext";

type Props = {
  src?: string;
  editorGuid: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  limits?: TransformLimits;
};
export function EditorImage({
  src,
  editorGuid,
  height,
  width,
  x,
  y,
  rotationDeg,
  limits,
}: Props) {
  const { selectedEditorGuid, setSelectedEditorGuid } = useEditor();
  const [image] = useImage(src || IMAGE_NOT_FOUND_URL);

  return (
    <Transformable selected={editorGuid === selectedEditorGuid} limits={limits}>
      <Image
        onClick={() => setSelectedEditorGuid(editorGuid)}
        image={image}
        width={width}
        height={height}
        x={x}
        y={y}
        rotation={rotationDeg}
      />
    </Transformable>
  );
}
