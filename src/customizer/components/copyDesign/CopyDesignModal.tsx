import { Modal } from "@/components/Modal";
import {
  setModalOpen,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import stylesModal from "@/styles/customizer/CustomProductDesigner/modal.module.css";
import styles from "@/styles/customizer/CustomProductDesigner/copyDesign.module.css";
import { useDispatch } from "react-redux";
import { ProductVariationCard } from "../ProductVariationCard";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { findVariationInCart } from "@/customizer/utils/find";
import { countVariationDesignObjects } from "@/customizer/utils/misc";
import { copyDesign } from "@/customizer/redux/slices/cart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faWarning } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export function CopyDesignModal() {
  const [clickedVariationId, setClickedVariationId] = useState(
    null as number | null
  );
  const { selectedProductData, selectedVariation } = useEditorSelectors();
  const cart = useSelector((store: StoreType) => store.cart.present);
  const existingDesign = countVariationDesignObjects(selectedVariation) > 0;
  const dispatch = useDispatch();

  function onClickCopy() {
    if (!clickedVariationId) return;
    dispatch(
      copyDesign({
        sourceVariationId: clickedVariationId,
        targetVariationId: selectedVariation.id,
      })
    );
    dispatch(setModalOpen(null));
  }

  return (
    <Modal
      windowClassName={`${stylesModal["modal"]} ${styles["main"]}`}
      xButtonClassName={stylesModal["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
    >
      <h2>Copy design</h2>
      <p>
        If you already created a design using a different garment color, this
        tool allows you to copy it to the current garment color.
      </p>
      <div>Copy from...</div>
      <div className={styles["scroll-container"]}>
        {selectedProductData.variations
          .filter((variation) => variation.id !== selectedVariation.id)
          .map((variation) => {
            const variationInCart = findVariationInCart(cart, variation.id);
            const hasDesign = variationInCart
              ? countVariationDesignObjects(variationInCart)
              : 0;

            return (
              <ProductVariationCard
                key={variation.id}
                variation={variation}
                disabled={!hasDesign}
                highlighted={clickedVariationId === variation.id}
                title={"This color has no designs yet."}
                onClick={() => setClickedVariationId(variation.id)}
                imageOverride={variationInCart?.views[0]?.currentRenderUrl}
              />
            );
          })}
      </div>
      {existingDesign && (
        <div className={styles["existing-design-warning"]}>
          <FontAwesomeIcon icon={faWarning} /> The color you&apos;re copying to
          already has a design. The existing design will be REPLACED if you
          continue.
        </div>
      )}
      <div className={styles["copy-button-container"]}>
        <button onClick={onClickCopy} disabled={!clickedVariationId}>
          <FontAwesomeIcon icon={faCopy} /> Copy
        </button>
      </div>
    </Modal>
  );
}
