import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { CONTACT_US_URL } from "@/constants";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";

type Props = {
  showError: boolean;
  onClickBack: () => void;
  submitting: boolean;
};
export function CartQuoteStep({ showError, onClickBack, submitting }: Props) {
  return (
    <div className={styles["quote-step-main"]}>
      <h2>Contact Information</h2>
      <div className={styles["primary-fields"]}>
        <div>
          <label htmlFor="first-name" className={styles["input-label"]}>
            First Name
          </label>
          <input type="text" name="first-name" id="first-name" required />
        </div>
        <div>
          <label htmlFor="last-name" className={styles["input-label"]}>
            Last Name
          </label>
          <input type="text" name="last-name" id="last-name" required />
        </div>
        <div>
          <label htmlFor="email" className={styles["input-label"]}>
            Email
          </label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="company" className={styles["input-label"]}>
            Union/Organization
          </label>
          <input type="text" name="company" id="company" required />
        </div>
        <div>
          <label htmlFor="local" className={styles["input-label"]}>
            Union Local
          </label>
          <input type="text" name="local" id="local" />
        </div>
        <div>
          <label htmlFor="phone" className={styles["input-label"]}>
            Phone
          </label>
          <input type="tel" name="phone" id="phone" />
        </div>
        <div className={styles["comments-container"]}>
          <label htmlFor="comments" className={styles["input-label"]}>
            Comments/Questions
          </label>
          <div className={styles["comments-subcontainer"]}>
            <textarea name="comments" id="comments" rows={6}></textarea>
            <div className={styles["comments-infobox"]}>
              Please let us know any customizations you want to this design.
              This includes changing the text colors and the design.
            </div>
          </div>
        </div>
      </div>
      {showError && (
        <div className={styles["request-error"]}>
          Error submitting request. Please try again later, or{" "}
          <a href={CONTACT_US_URL}>contact us</a> for assistance.
        </div>
      )}
      <div className={styles["quote-buttons-container"]}>
        <button className="button-minor" onClick={onClickBack}>
          Back
        </button>
        <ButtonWithLoading
          type="submit"
          normalText="Submit"
          loading={submitting}
          className={styles["submit-button"]}
          spinnerClassName={styles["submit-spinner"]}
        />
      </div>
    </div>
  );
}
