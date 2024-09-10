import { CartStateProductView } from "@/types/schema/customizer";
import { Image } from "canvas";
import Konva from "konva";
import { convertDesignerObjectData } from "./utils";

export async function renderCartProductView(
  view: CartStateProductView,
  bgImgUrl: string
): Promise<Buffer> {
  const stageSize = 650;
  //ts ignore is used in this function due to what seems to be some shortcomings in Konva type definitions.
  //the official docs say that you shouldn't need to provide a container to Konva.Stage when using in Node.js.
  //@ts-ignore
  const stage = new Konva.Stage({
    width: stageSize,
    height: stageSize,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const imageObj = await loadImage(bgImgUrl);
  const img = new Konva.Image({
    //@ts-ignore
    image: imageObj,
    x: 0,
    y: 0,
    width: stageSize,
    height: stageSize,
  });
  layer.add(img);

  for (const location of view.locations) {
    // const location = view.locations[j]!;
    for (const artwork of location.artworks) {
      //   const artwork = location.artworks[k]!;
      const { rotationDegrees } = artwork.objectData;
      const { position, size } = convertDesignerObjectData(
        stageSize,
        stageSize,
        artwork.objectData
      );

      const imageObj = await loadImage(artwork.imageUrl);
      const img = new Konva.Image({
        //@ts-ignore
        image: imageObj,
        x: position.x,
        y: position.y,
        width: size.x,
        height: size.y,
        rotation: rotationDegrees,
      });
      layer.add(img);
    }
  }

  const frame = stage.toCanvas({ pixelRatio: 2 });
  //@ts-ignore
  return frame.toBuffer();
}

//from https://stackoverflow.com/questions/2342132/waiting-for-image-to-load-in-javascript/66180709#66180709
async function loadImage(src: string): Promise<Image> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
