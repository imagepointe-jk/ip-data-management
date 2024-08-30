import { IMAGE_NOT_FOUND_URL } from "@/constants";
import useImage from "use-image";
import { Transformable, TransformLimits } from "./Transformable";
import { Image } from "react-konva";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { useDispatch } from "react-redux";
import { setSelectedEditorGuid } from "@/customizer/redux/slices/editor";
// import { useEditor } from "../../EditorProvider";

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
  // const { selectedEditorGuid, setSelectedEditorGuid } = useEditor();
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const dispatch = useDispatch();
  const [image] = useImage(src || IMAGE_NOT_FOUND_URL);

  return (
    <Transformable selected={editorGuid === selectedEditorGuid} limits={limits}>
      <Image
        onClick={() => dispatch(setSelectedEditorGuid(editorGuid))}
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
