"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import {
  setSelectedEditorGuid,
  setSelectedLocationId,
  setSelectedVariationId,
  setSelectedViewId,
  useEditorSelectors,
} from "../redux/slices/editor";
import { findVariationInCart } from "../utils";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import {
  addProductVariation,
  removeProductVariation,
} from "../redux/slices/cart";

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
  const isVariationInCart = !!findVariationInCart(cart.present, variationId);
  const totalVariationsThisProduct =
    cart.present.products.find(
      (product) => product.id === selectedProductData.id
    )?.variations.length || 0;
  const removeAllowed = totalVariationsThisProduct > 1;

  function onClickEdit() {
    if (!isVariationInCart || !variationData) return;

    const firstView = variationData.views[0];
    if (!firstView) throw new Error("No views");

    const firstLocation = firstView.locations[0];
    if (!firstLocation) throw new Error("No locations");

    dispatch(setSelectedVariationId(variationData.id));
    dispatch(setSelectedViewId(firstView.id));
    dispatch(setSelectedLocationId(firstLocation.id));
    dispatch(setSelectedEditorGuid(null));
  }

  function onClickAdd() {
    if (isVariationInCart || !variationData) return;

    const firstView = variationData.views[0];
    if (!firstView) throw new Error("No views");

    const firstLocation = firstView.locations[0];
    if (!firstLocation) throw new Error("No locations");

    dispatch(
      addProductVariation({
        variationId,
        targetProductData: selectedProductData,
      })
    );

    dispatch(setSelectedVariationId(variationData.id));
    dispatch(setSelectedViewId(firstView.id));
    dispatch(setSelectedLocationId(firstLocation.id));
    dispatch(setSelectedEditorGuid(null));
  }

  function onClickRemove() {
    if (!isVariationInCart && removeAllowed) return;

    const productInState = cart.present.products.find(
      (product) => product.id === selectedProductData.id
    );
    const variationToSelect = productInState?.variations.filter(
      (variation) => variation.id !== variationId
    )[0];
    if (!variationToSelect) throw new Error("Can't delete last variation");

    const viewToSelect = variationToSelect.views[0];
    if (!viewToSelect) throw new Error("No view to select");

    const locationToSelect = viewToSelect.locations[0];
    if (!locationToSelect) throw new Error("No location to select");

    dispatch(
      removeProductVariation({
        targetProductId: selectedProductData.id,
        variationId,
      })
    );
    dispatch(setSelectedVariationId(variationToSelect.id));
    dispatch(setSelectedViewId(viewToSelect.id));
    dispatch(setSelectedLocationId(locationToSelect.id));
    dispatch(setSelectedEditorGuid(null));
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
          <button onClick={onClickEdit} disabled={!isVariationInCart}>
            Edit
          </button>
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
