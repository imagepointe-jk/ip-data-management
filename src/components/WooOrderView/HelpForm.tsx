import { CONTACT_US_URL } from "@/constants";
import styles from "@/styles/WooOrderView.module.css";
import { FormEvent, useState } from "react";
import { ButtonWithLoading } from "../ButtonWithLoading";

type Props = {
  setHelpMode: (b: boolean) => void;
  onSubmitHelpForm: (data: FormData) => Promise<void>;
};
export function HelpForm({ setHelpMode, onSubmitHelpForm }: Props) {
  const [submitState, setSubmitState] = useState(
    "initial" as "initial" | "loading" | "error" | "success"
  );

  async function onClickSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState("loading");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await onSubmitHelpForm(formData);
      setSubmitState("success");
    } catch (error) {
      console.error(error);
      setSubmitState("error");
    }
  }

  return (
    <form className={styles["help-form"]} onSubmit={onClickSubmit}>
      <button
        className={styles["help-back"]}
        onClick={() => setHelpMode(false)}
      >
        &lt; Back
      </button>
      <h3>Request Order Help</h3>
      <div>Question/comments</div>
      <textarea rows={10} cols={30} name="comments"></textarea>
      <ButtonWithLoading
        className={styles["submit"]}
        normalText="Submit"
        loading={submitState === "loading"}
      />
      {submitState === "success" && (
        <div className={styles["help-form-result"]}>
          Your request has been submitted.
        </div>
      )}
      {submitState === "error" && (
        <div
          className={`${styles["help-form-result"]} ${styles["help-error"]}`}
        >
          There was an error submitting your request. Please{" "}
          <a href={CONTACT_US_URL}>contact us</a> for assistance.
        </div>
      )}
    </form>
  );
}
