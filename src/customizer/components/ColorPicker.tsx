"use client";

import styles from "@/styles/customizer/CustomProductDesigner/variationPicker.module.css";
import {
  setModalOpen,
  setSelectedEditorGuid,
  setSelectedVariationId,
  setSelectedViewId,
  useEditorSelectors,
} from "../redux/slices/editor";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import { addProductVariation, pruneCart } from "../redux/slices/cart";
import { useEditor } from "../EditorProvider";
import { findVariationInCart } from "../utils/find";
import { ProductVariationCard } from "./ProductVariationCard";

export function ColorPicker() {
  const { selectedProductData, selectedView } = useEditorSelectors();
  const cart = useSelector((state: StoreType) => state.cart);
  const dispatch = useDispatch();
  const { updateViewRender } = useEditor();

  function onClickVariation(id: number) {
    const variationData = selectedProductData.variations.find(
      (variation) => variation.id === id
    );
    const isVariationInCart = !!findVariationInCart(cart.present, id);

    if (!variationData) return;
    if (!isVariationInCart)
      dispatch(
        addProductVariation({
          variationId: variationData.id,
          targetProductData: selectedProductData,
        })
      );

    updateViewRender(selectedView.id);
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
    <div className={styles["main"]}>
      <h2>Select a Color</h2>
      <div className={styles["scroll-container"]}>
        <div className={styles["cards-container"]}>
          {selectedProductData.variations.map((variation) => (
            <ProductVariationCard
              key={variation.id}
              variation={variation}
              onClick={() => onClickVariation(variation.id)}
            />
          ))}
        </div>
      </div>
      <button
        className="button-danger"
        onClick={() => {
          dispatch(setModalOpen("start over"));
        }}
      >
        Start Over
      </button>
    </div>
  );
}
