import Konva from "konva";
import { useEffect, useRef } from "react";
import { Image, Rect, Transformer } from "react-konva";
import useImage from "use-image";

export function Transformable() {
  const [image] = useImage(
    "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*"
  );
  const imgRef = useRef<Konva.Image>(null);
  const shapeRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    const shape = shapeRef.current;
    const img = imgRef.current;
    if (!transformer || !img) return;

    transformer.nodes([img]);
    transformer.getLayer()?.batchDraw();
  }, []);

  return (
    <>
      {/* <Rect
        ref={shapeRef}
        x={100}
        y={100}
        width={100}
        height={100}
        fill={"red"}
        draggable
      /> */}
      <Image image={image} width={300} height={300} ref={imgRef} draggable />
      <Transformer ref={transformerRef} />
    </>
  );
}
