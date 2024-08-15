import { IMAGE_NOT_FOUND_URL } from "@/constants";
import useImage from "use-image";
import { Transformable } from "./Transformable";
import { Image } from "react-konva";

type Props = {
  src?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotationDeg?: number;
};
export function EditorImage({ src, height, width, x, y, rotationDeg }: Props) {
  const [image] = useImage(src || IMAGE_NOT_FOUND_URL);

  return (
    <Transformable>
      <Image
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
