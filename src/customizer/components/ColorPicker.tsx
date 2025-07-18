"use client";

import styles from "@/styles/customizer/CustomProductDesigner/variationPicker.module.css";
import {
  setDialogOpen,
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
import { useEffect, useState } from "react";
import { countVariationDesignObjects } from "../utils/misc";

export function ColorPicker() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { selectedProductData, selectedView } = useEditorSelectors();
  const cart = useSelector((state: StoreType) => state.cart);
  const dispatch = useDispatch();
  const { updateViewRender } = useEditor();
  const selectedVariationData = selectedProductData.variations.find(
    (variation) => variation.id === selectedId
  );
  const variationInCart = selectedId
    ? findVariationInCart(cart.present, selectedId)
    : undefined;
  const selectedVariationDesignCount = variationInCart
    ? countVariationDesignObjects(variationInCart)
    : 0;

  function onClickVariation(id: number) {
    setSelectedId(id);
  }

  function onClickEdit() {
    dispatch(setDialogOpen(null));
  }

  useEffect(() => {
    if (!selectedId || !selectedVariationData) return;

    const isVariationInCart = !!findVariationInCart(cart.present, selectedId);
    if (!isVariationInCart)
      dispatch(
        addProductVariation({
          variationId: selectedVariationData.id,
          targetProductData: selectedProductData,
        })
      );

    updateViewRender(selectedView.id);
    //the variation we're switching from might not have any designs, so prune the cart to prevent the user accumulating untouched variations
    dispatch(pruneCart({ variationIdToPreserve: selectedVariationData.id }));
    const firstView = selectedVariationData.views[0];
    if (!firstView) throw new Error("No views");

    const firstLocation = firstView.locations[0];
    if (!firstLocation) throw new Error("No locations");

    dispatch(setSelectedVariationId(selectedVariationData.id));
    dispatch(setSelectedViewId(firstView.id));
    dispatch(setSelectedEditorGuid(null));
  }, [selectedId]);

  return (
    <div className={styles["main"]}>
      <h2>Select a Color</h2>
      <div className={styles["scroll-container"]}>
        <div className={styles["cards-container"]}>
          {selectedProductData.variations.map((variation) => (
            <ProductVariationCard
              key={variation.id}
              variation={variation}
              highlighted={variation.id === selectedId}
              onClick={() => onClickVariation(variation.id)}
            />
          ))}
        </div>
      </div>
      <div className={styles["edit-button-container"]}>
        <button onClick={onClickEdit} disabled={!selectedId}>
          {selectedVariationDesignCount > 0 ? "Edit Design" : "Start Designing"}
        </button>
      </div>
    </div>
  );
}
