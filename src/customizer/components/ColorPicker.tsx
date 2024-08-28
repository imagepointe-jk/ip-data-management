"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useEditor } from "../EditorContext";

export function ColorPicker() {
  const { selectedProductData } = useEditor();

  return (
    <div className={styles["variation-choices-container"]}>
      {selectedProductData.variations.map((variation) => (
        <VariationChoice key={variation.id} variationId={variation.id} />
      ))}
    </div>
  );
}

type VariationChoiceProps = {
  variationId: number;
};
function VariationChoice({ variationId }: VariationChoiceProps) {
  const { selectedProductData, designState, addVariation, removeVariation } =
    useEditor();

  const variationData = selectedProductData.variations.find(
    (variation) => variation.id === variationId
  );
  const isVariationInCart = !!designState.products.find(
    (product) =>
      !!product.variations.find((variation) => variation.id === variationId)
  );
  const totalVariationsThisProduct =
    designState.products.find(
      (product) => product.id === selectedProductData.id
    )?.variations.length || 0;
  const removeAllowed = totalVariationsThisProduct > 1;

  function onClickAdd() {
    if (isVariationInCart) return;
    addVariation(variationId);
  }

  function onClickRemove() {
    if (!isVariationInCart && removeAllowed) return;
    removeVariation(variationId);
  }

  return (
    <div className={styles["variation-choice"]}>
      {variationData && (
        <>
          <div
            className={styles["variation-choice-swatch"]}
            style={{ backgroundColor: `#${variationData.color.hexCode}` }}
          ></div>
          <div>{variationData.color.name}</div>
          <button disabled={!isVariationInCart}>Edit</button>
          <button onClick={onClickAdd} disabled={isVariationInCart}>
            Add
          </button>
          <button
            onClick={onClickRemove}
            disabled={!isVariationInCart || !removeAllowed}
          >
            Remove
          </button>
        </>
      )}
    </div>
  );
}
