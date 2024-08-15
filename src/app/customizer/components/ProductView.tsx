"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useEditor } from "../EditorContext";
import { Image, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { Transformable } from "./productView/Transformable";
import { EditorImage } from "./productView/EditorImage";
import { convertDesignerObjectData } from "@/customizer/editor";

const editorSize = 650; //temporary; eventually width will need to be dynamic to allow for view resizing

export function ProductView() {
  const { selectedView, designState } = useEditor();
  const [image] = useImage(selectedView?.imageUrl || IMAGE_NOT_FOUND_URL);
  const [imageDog] = useImage(
    "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*"
  );

  return (
    <Stage
      width={editorSize}
      height={editorSize}
      style={{ position: "absolute", left: "300px", top: "25px" }}
      scale={{ x: 1, y: 1 }}
    >
      <Layer>
        <Image image={image} width={editorSize} height={editorSize} />
        {designState.artworks.map((art) => {
          const { position, size } = convertDesignerObjectData(
            editorSize,
            editorSize,
            art.objectData
          );
          return (
            <EditorImage
              key={art.objectData.editorGuid}
              src={art.imageUrl}
              x={position.x}
              y={position.y}
              width={size.x}
              height={size.y}
              rotationDeg={art.objectData.rotationDegrees}
            />
          );
        })}
        {/* <Transformable>
          <Image image={imageDog} width={200} height={200} />
        </Transformable>
        <Transformable>
          <Image image={imageDog} width={200} height={200} x={200} />
        </Transformable> */}
      </Layer>
    </Stage>
  );
}
