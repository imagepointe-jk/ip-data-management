import {
  findTextInCart,
  findViewInCart,
  findViewInProductData,
} from "@/customizer/utils/find";
import {
  CartState,
  EditorTextData,
  EditorTextStyle,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import { PayloadAction } from "@reduxjs/toolkit";
import { createNewObjectData } from "./object";
import { snapToNearest } from "@/utility/geometry";

type AddTextPayload = {
  targetViewId: number;
  targetProductData: PopulatedProductSettingsSerializable;
  newGuid: string;
};
type EditTextPayload = Omit<EditorTextData, "text"> & {
  text?: string;
  guid: string;
};

export function addText(
  state: CartState,
  action: PayloadAction<AddTextPayload>
) {
  const { newGuid, targetViewId, targetProductData } = action.payload;

  const viewInState = findViewInCart(state, targetViewId);
  if (!viewInState) throw new Error(`View ${targetViewId} not found in state`);

  const objectData = createNewObjectData(newGuid);
  const viewInProductData = findViewInProductData(
    targetProductData,
    targetViewId
  );
  if (!viewInProductData)
    throw new Error(`View ${targetViewId} not found in product data`);
  const snapped = snapToNearest(
    {
      position: {
        x: objectData.positionNormalized.x,
        y: objectData.positionNormalized.y,
      },
      size: {
        x: objectData.sizeNormalized.x,
        y: objectData.sizeNormalized.y,
      },
    },
    viewInProductData.locations.map((location) => ({
      position: { x: location.positionX, y: location.positionY },
      size: { x: location.width, y: location.height },
    }))
  );

  viewInState.texts.push({
    textData: {
      text: "New Text",
      style: {
        fontSize: 20,
        hexCode: "#000000",
        align: "left",
      },
    },
    objectData: {
      ...objectData,
      positionNormalized: {
        x: snapped.position.x,
        y: snapped.position.y,
      },
      sizeNormalized: {
        x: snapped.size.x,
        y: snapped.size.y,
      },
    },
  });
}

export function editText(
  state: CartState,
  action: PayloadAction<EditTextPayload>
) {
  const { guid, style: incomingStyle, text: incomingText } = action.payload;
  const text = findTextInCart(state, guid);
  if (!text) throw new Error("Text not found");

  const { textData } = text;
  if (incomingText !== undefined) textData.text = incomingText;

  if (!incomingStyle) return;

  const newStyle: EditorTextStyle = {};
  text.textData.style = text.textData.style || newStyle;

  if (incomingStyle.align) text.textData.style.align = incomingStyle.align;
  if (incomingStyle.fontSize)
    text.textData.style.fontSize = incomingStyle.fontSize;
  if (incomingStyle.fontStyle !== undefined)
    text.textData.style.fontStyle = incomingStyle.fontStyle || undefined;
  if (incomingStyle.hexCode !== undefined)
    text.textData.style.hexCode = incomingStyle.hexCode || undefined;
  if (incomingStyle.strokeHexCode !== undefined)
    text.textData.style.strokeHexCode =
      incomingStyle.strokeHexCode || undefined;
  if (incomingStyle.strokeWidth !== undefined)
    text.textData.style.strokeWidth = incomingStyle.strokeWidth;
  if (incomingStyle.textDecoration !== undefined)
    text.textData.style.textDecoration = incomingStyle.textDecoration;
  if (incomingStyle.fontFamily !== undefined)
    text.textData.style.fontFamily = incomingStyle.fontFamily;
}
