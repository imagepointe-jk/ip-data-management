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
    <>
      <div>
        <h2>Contact Information</h2>
        <div className={styles["contact-form"]}>
          <div>
            <label htmlFor="first-name">First Name</label>
            <input type="text" name="first-name" id="first-name" required />
          </div>
          <div>
            <label htmlFor="last-name">Last Name</label>
            <input type="text" name="last-name" id="last-name" required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" required />
          </div>
          <div>
            <label htmlFor="company">Union/Organization</label>
            <input type="text" name="company" id="company" required />
          </div>
          <div>
            <label htmlFor="local">Union Local</label>
            <input type="text" name="local" id="local" />
          </div>
          <div>
            <label htmlFor="comments">Comments/Questions</label>
            <textarea
              name="comments"
              id="comments"
              cols={50}
              rows={6}
            ></textarea>
          </div>
        </div>
        {showError && (
          <div className={styles["request-error"]}>
            Error submitting request. Please try again later, or{" "}
            <a href={CONTACT_US_URL}>contact us</a> for assistance.
          </div>
        )}
      </div>
      <div className={styles["step-buttons-container"]}>
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
        {/* <button type="submit">Submit</button> */}
      </div>
    </>
  );
}
