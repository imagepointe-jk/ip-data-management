import { Modal } from "@/components/Modal";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../../redux/store";
import { CartStateProduct } from "@/types/schema/customizer";
import { setModalOpen, useEditorSelectors } from "../../redux/slices/editor";
import { useDispatch } from "react-redux";
import { CartProductVariation } from "./CartProductVariation";
import { FormEvent, useState } from "react";
import { CartQuoteStep } from "./CartQuoteStep";
import { submitQuoteRequest } from "@/fetch/client/customizer";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export function CartModal() {
  const [step, setStep] = useState("review" as "review" | "quote");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((store: StoreType) => store.cart.present);

  async function onClickSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const firstName = `${formData.get("first-name")}`;
    const lastName = `${formData.get("last-name")}`;
    const email = `${formData.get("email")}`;
    const company = `${formData.get("company")}`;
    const local = `${formData.get("local")}`;
    const comments = `${formData.get("comments")}`;

    setSubmitting(true);
    setError(false);
    try {
      const response = await submitQuoteRequest({
        firstName,
        lastName,
        email,
        company,
        local,
        comments,
        cart,
      });
      const json = await response.json();
      console.log(json);
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setSubmitting(false);
  }

  return (
    <Modal
      windowClassName={styles["modal"]}
      xButtonClassName={styles["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
    >
      <form className={styles["modal-form"]} onSubmit={onClickSubmit}>
        <div>
          {step === "review" && <CartReviewStep />}
          {step === "quote" && <CartQuoteStep showError={error} />}
        </div>
        <div className={styles["step-buttons-container"]}>
          {step === "review" && (
            <>
              <button type="button" onClick={() => setStep("quote")}>
                Continue
              </button>
            </>
          )}
          {step === "quote" && (
            <>
              <button
                type="button"
                className="button-minor"
                onClick={() => setStep("review")}
              >
                Back
              </button>
              <button className={styles["submit-button"]}>
                {!submitting && "Submit"}
                {submitting && (
                  <LoadingIndicator className={styles["submit-spinner"]} />
                )}
              </button>
            </>
          )}
        </div>
      </form>
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
