import { Modal } from "@/components/Modal";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../../redux/store";
import { CartStateProduct } from "@/types/schema/customizer";
import { setModalOpen, useEditorSelectors } from "../../redux/slices/editor";
import { useDispatch } from "react-redux";
import { CartProductVariation } from "./CartProductVariation";
import { useState } from "react";
import { CartQuoteStep } from "./CartQuoteStep";

export function CartModal() {
  const [step, setStep] = useState("review" as "review" | "quote");
  const dispatch = useDispatch();

  return (
    <Modal
      windowClassName={styles["modal"]}
      xButtonClassName={styles["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
    >
      <div>
        {step === "review" && <CartReviewStep />}
        {step === "quote" && <CartQuoteStep />}
      </div>
      <div className={styles["step-buttons-container"]}>
        {step === "review" && (
          <>
            <button onClick={() => setStep("quote")}>Continue</button>
          </>
        )}
        {step === "quote" && (
          <>
            <button onClick={() => setStep("review")}>Back</button>
            <button>Submit</button>
          </>
        )}
      </div>
    </Modal>
  );
}

function CartReviewStep() {
  const cart = useSelector((store: StoreType) => store.cart);

  return (
    <>
      <h2>My Cart</h2>
      <div className={styles["cart-items-container"]}>
        {cart.present.products.map((item) => (
          <CartProductGroup key={item.id} productInState={item} />
        ))}
      </div>
    </>
  );
}

type CartProductProps = {
  productInState: CartStateProduct;
};
function CartProductGroup({ productInState }: CartProductProps) {
  const { allProductData } = useEditorSelectors();
  const product = allProductData.find(
    (product) => product.id === productInState.id
  );

  return (
    <div>
      {!product && <>Invalid product.</>}
      {product &&
        productInState.variations.map((variation) => (
          <CartProductVariation
            key={variation.id}
            productData={product}
            variationInState={variation}
          />
        ))}
    </div>
  );
}
