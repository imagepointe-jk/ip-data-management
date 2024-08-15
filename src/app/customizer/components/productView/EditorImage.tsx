import { IMAGE_NOT_FOUND_URL } from "@/constants";
import useImage from "use-image";
import { Transformable } from "./Transformable";
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
};
export function EditorImage({
  src,
  editorGuid,
  height,
  width,
  x,
  y,
  rotationDeg,
}: Props) {
  const { selectedEditorGuid, setSelectedEditorGuid } = useEditor();
  const [image] = useImage(src || IMAGE_NOT_FOUND_URL);

  return (
    <Transformable selected={editorGuid === selectedEditorGuid}>
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
