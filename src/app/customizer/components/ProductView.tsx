"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useEditor } from "../EditorContext";
import { Image, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { Transformable } from "./productView/Transformable";

export function ProductView() {
  const { selectedView } = useEditor();
  const [image] = useImage(selectedView?.imageUrl || IMAGE_NOT_FOUND_URL);
  const [imageDog] = useImage(
    "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*"
  );

  return (
    <Stage
      width={650}
      height={650}
      style={{ position: "absolute", left: "300px", top: "25px" }}
      scale={{ x: 1, y: 1 }}
    >
      <Layer>
        <Image image={image} width={650} height={650} />
        <Transformable>
          <Image image={imageDog} width={200} height={200} />
        </Transformable>
        <Transformable>
          <Image image={imageDog} width={200} height={200} x={200} />
        </Transformable>
      </Layer>
    </Stage>
  );
}
