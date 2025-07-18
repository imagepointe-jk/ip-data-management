import { Modal } from "@/components/Modal";
import {
  setModalOpen,
  setSelectedVariationId,
  setSelectedViewId,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import stylesModal from "@/styles/customizer/CustomProductDesigner/modal.module.css";
import styles from "@/styles/customizer/CustomProductDesigner/copyDesign.module.css";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { findVariationInCart } from "@/customizer/utils/find";
import { countVariationDesignObjects } from "@/customizer/utils/misc";
import {
  addProductVariation,
  copyDesign,
} from "@/customizer/redux/slices/cart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCopy,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { VariationSelector } from "./VariationSelector";
import { waitForMs } from "@/utility/misc";
import { useEditor } from "@/customizer/EditorProvider";

export function CopyDesignModal() {
  const [sourceVariationId, setSourceVariationId] = useState(
    null as number | null
  );
  const [targetVariationIds, setTargetVariationIds] = useState<number[]>([]);
  const { selectedProductData, selectedVariation, selectedView } =
    useEditorSelectors();
  const { updateViewRender } = useEditor();
  const cart = useSelector((store: StoreType) => store.cart.present);
  const existingDesign = countVariationDesignObjects(selectedVariation) > 0;
  const dispatch = useDispatch();

  function onClickSourceVariation(id: number) {
    setSourceVariationId(id);
    if (targetVariationIds.includes(id))
      setTargetVariationIds(
        targetVariationIds.filter((existingId) => id !== existingId)
      );
  }

  function onClickTargetVariation(id: number) {
    if (targetVariationIds.includes(id))
      setTargetVariationIds(
        targetVariationIds.filter((existingId) => existingId !== id)
      );
    else setTargetVariationIds([...targetVariationIds, id]);
  }

  function shouldDisableSourceVariation(id: number) {
    const variationInCart = findVariationInCart(cart, id);
    const hasDesign = variationInCart
      ? countVariationDesignObjects(variationInCart)
      : 0;
    return !hasDesign;
  }

  function shouldDisableTargetVariation(id: number) {
    return sourceVariationId === id;
  }

  //copy an arbitrary number of artworks and text to an arbitrary number of variations.
  //due to the react/redux/konva setup, we copy all the designs first, then cycle through every single affected view so that it draws on the canvas and we can save the rendered image.
  //to (mostly) guarantee that each image loads in after we switch to a view, we wait some time after each switch before saving the render.
  //this is not a great approach because of the long wait time, but a better solution has not been found yet.
  async function onClickCopy() {
    if (!sourceVariationId || targetVariationIds.length === 0) return;
    const initialVariationId = selectedVariation.id;
    const initialViewId = selectedView.id;

    for (const id of targetVariationIds) {
      let variation = findVariationInCart(cart, id);
      if (!variation) {
        const productInState = cart.products.find(
          (product) => product.id === selectedProductData.id
        );
        if (!productInState)
          throw new Error(`Couldn't find product id ${selectedProductData.id}`);

        //if the variation wasn't already in the cart, add it now
        dispatch(
          addProductVariation({
            variationId: id,
            targetProductData: selectedProductData,
          })
        );
      }

      //now that we know the variation is there, copy the design to it from the source
      dispatch(copyDesign({ sourceVariationId, targetVariationId: id }));
      // dispatch(setSelectedVariationId(id));

      const views = selectedProductData.variations.find(
        (variation) => variation.id === id
      )?.views;
      if (!views) throw new Error("Views not found");

      //loop through each view, select it so it draws on the canvas, and store that render
      for (const view of views) {
        dispatch(setSelectedViewId(view.id));
        await waitForMs(1000);
        updateViewRender(view.id);
      }
    }
    //switch back to whatever the user was viewing before we took away control
    dispatch(setSelectedVariationId(initialVariationId));
    dispatch(setSelectedViewId(initialViewId));
  }

  return (
    <Modal
      windowClassName={`${stylesModal["modal"]} ${styles["main"]}`}
      xButtonClassName={stylesModal["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
    >
      <h2>Copy design</h2>
      <p>Copy an existing design to other garment colors.</p>
      <div className={styles["main-flex"]}>
        <div>
          Copy from...
          <VariationSelector
            highlightIds={sourceVariationId ? [sourceVariationId] : []}
            shouldDisableVariation={shouldDisableSourceVariation}
            createDisabledMessage={() => "This color has no designs yet."}
            onClickVariation={onClickSourceVariation}
          />
        </div>
        <div>
          <FontAwesomeIcon icon={faArrowRight} size="2x" />
        </div>
        <div>
          Copy to...
          <VariationSelector
            highlightIds={targetVariationIds}
            shouldDisableVariation={shouldDisableTargetVariation}
            createDisabledMessage={() =>
              "This is the color you're copying from."
            }
            onClickVariation={onClickTargetVariation}
          />
        </div>
      </div>
      {existingDesign && (
        <div className={styles["existing-design-warning"]}>
          <FontAwesomeIcon icon={faWarning} /> The color you&apos;re copying to
          already has a design. The existing design will be REPLACED if you
          continue.
        </div>
      )}
      <div className={styles["copy-button-container"]}>
        <button
          onClick={onClickCopy}
          disabled={!sourceVariationId || targetVariationIds.length === 0}
        >
          <FontAwesomeIcon icon={faCopy} /> Copy
        </button>
      </div>
    </Modal>
  );
}
