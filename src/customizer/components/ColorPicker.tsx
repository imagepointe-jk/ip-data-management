"use client";

import styles from "@/styles/customizer/CustomProductDesigner/variationPicker.module.css";
import {
  setSelectedEditorGuid,
  setSelectedVariationId,
  setSelectedViewId,
  useEditorSelectors,
} from "../redux/slices/editor";
import { findVariationInCart } from "../utils/utils";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import { addProductVariation, pruneCart } from "../redux/slices/cart";

export function ColorPicker() {
  const { selectedProductData } = useEditorSelectors();

  return (
    <div className={styles["main"]}>
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
  const isVariationInCart = !!findVariationInCart(cart.present, variationId);
  const totalVariationsThisProduct =
    cart.present.products.find(
      (product) => product.id === selectedProductData.id
    )?.variations.length || 0;
  const removeAllowed = totalVariationsThisProduct > 1;

  function onClickEdit() {
    if (!variationData) return;
    if (!isVariationInCart)
      dispatch(
        addProductVariation({
          variationId: variationData.id,
          targetProductData: selectedProductData,
        })
      );

    //the variation we're switching from might not have any designs, so prune the cart to prevent the user accumulating untouched variations
    dispatch(pruneCart({ variationIdToPreserve: variationData.id }));
    const firstView = variationData.views[0];
    if (!firstView) throw new Error("No views");

    const firstLocation = firstView.locations[0];
    if (!firstLocation) throw new Error("No locations");

    dispatch(setSelectedVariationId(variationData.id));
    dispatch(setSelectedViewId(firstView.id));
    dispatch(setSelectedEditorGuid(null));
  }

  return (
    <div className={styles["choice"]}>
      {variationData && (
        <>
          <div
            className={styles["choice-swatch"]}
            style={{ backgroundColor: `#${variationData.color.hexCode}` }}
          ></div>
          <div>{variationData.color.name}</div>
          <button onClick={onClickEdit}>Edit</button>
        </>
      )}
    </div>
  );
}
