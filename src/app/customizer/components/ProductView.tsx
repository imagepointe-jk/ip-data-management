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

  return (
    <Stage
      width={650}
      height={650}
      style={{ position: "absolute", left: "300px", top: "25px" }}
      scale={{ x: 1, y: 1 }}
    >
      <Layer>
        <Image image={image} width={650} height={650} />
        <Transformable />
      </Layer>
    </Stage>
  );
}
