"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useEditorSelectors } from "../redux/slices/editor";
import { findVariationInState } from "../utils";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import { addVariation, removeVariation } from "../redux/slices/cart";

export function ColorPicker() {
  const { selectedProductData } = useEditorSelectors();

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
  const { selectedProductData } = useEditorSelectors();
  const cart = useSelector((state: StoreType) => state.cart);
  const dispatch = useDispatch();

  const variationData = selectedProductData.variations.find(
    (variation) => variation.id === variationId
  );
  const isVariationInCart = !!findVariationInState(cart, variationId);
  const totalVariationsThisProduct =
    cart.products.find((product) => product.id === selectedProductData.id)
      ?.variations.length || 0;
  const removeAllowed = totalVariationsThisProduct > 1;

  function onClickAdd() {
    if (isVariationInCart) return;
    dispatch(addVariation({ variationId }));
  }

  function onClickRemove() {
    if (!isVariationInCart && removeAllowed) return;
    removeVariation({ variationId });
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
