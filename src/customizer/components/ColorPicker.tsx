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
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useEditor } from "../EditorProvider";

export function ColorPicker() {
  const { selectedProductData } = useEditorSelectors();

  return (
    <div className={styles["main"]}>
      <h2>Select a Color</h2>
      <div className={styles["scroll-container"]}>
        <div className={styles["cards-container"]}>
          {selectedProductData.variations.map((variation) => (
            <VariationChoice key={variation.id} variationId={variation.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

type VariationChoiceProps = {
  variationId: number;
};
function VariationChoice({ variationId }: VariationChoiceProps) {
  const { selectedProductData, selectedView } = useEditorSelectors();
  const cart = useSelector((state: StoreType) => state.cart);
  const dispatch = useDispatch();
  const { updateViewRender } = useEditor();

  const variationData = selectedProductData.variations.find(
    (variation) => variation.id === variationId
  );
  const isVariationInCart = !!findVariationInCart(cart.present, variationId);

  function onClick() {
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

    updateViewRender(selectedView.id);
    dispatch(setSelectedVariationId(variationData.id));
    dispatch(setSelectedViewId(firstView.id));
    dispatch(setSelectedEditorGuid(null));
  }

  return (
    <div className={styles["card"]} onClick={onClick}>
      {variationData && (
        <>
          <div className={styles["img-container"]}>
            <img
              src={variationData.views[0]?.imageUrl || IMAGE_NOT_FOUND_URL}
            />
          </div>
          <div className={styles["color-label"]}>
            {variationData.color.name}
          </div>
        </>
      )}
      {!variationData && <>MISSING VARIATION DATA</>}
    </div>
  );
}
