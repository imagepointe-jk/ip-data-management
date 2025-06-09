import { Modal } from "@/components/Modal";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import stylesModal from "@/styles/customizer/CustomProductDesigner/modal.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../../redux/store";
import { setModalOpen } from "../../redux/slices/editor";
import { useDispatch } from "react-redux";
import { FormEvent, useState } from "react";
import { CartQuoteStep } from "./CartQuoteStep";
import { submitQuoteRequest } from "@/fetch/client/customizer";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { CartReviewStep } from "./CartReviewStep";
import { CartSuccessStep } from "./CartSuccessStep";

export function CartModal() {
  const [step, setStep] = useState("review" as "review" | "quote" | "success");
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
    const phone = `${formData.get("phone")}`;
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
        phone,
        comments,
        cart,
      });
      await response.json();
      setStep("success");
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setSubmitting(false);
  }

  return (
    <Modal
      windowClassName={`${styles["cart-modal"]} ${stylesModal["modal"]}`}
      xButtonClassName={stylesModal["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
    >
      <form className={styles["modal-form"]} onSubmit={onClickSubmit}>
        {step === "review" && (
          <CartReviewStep onClickContinue={() => setStep("quote")} />
        )}
        {step === "quote" && (
          <CartQuoteStep
            showError={error}
            submitting={submitting}
            onClickBack={() => setStep("review")}
          />
        )}
        {step === "success" && <CartSuccessStep />}
      </form>
    </Modal>
  );
}
