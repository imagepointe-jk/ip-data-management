import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { CONTACT_US_URL } from "@/constants";
import {
  setComments,
  setCompany,
  setEmail,
  setFirstName,
  setLastName,
  setLocal,
  setPhone,
} from "@/customizer/redux/slices/cart";
import { StoreType } from "@/customizer/redux/store";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

type Props = {
  showError: boolean;
  onClickBack: () => void;
  submitting: boolean;
};
export function CartQuoteStep({ showError, onClickBack, submitting }: Props) {
  const dispatch = useDispatch();
  const { firstName, lastName, email, company, local, phone, comments } =
    useSelector((store: StoreType) => store.cart.present.contactInfo);

  return (
    <div className={styles["quote-step-main"]}>
      <h2>Contact Information</h2>
      <div className={styles["primary-fields"]}>
        <div>
          <label htmlFor="first-name" className={styles["input-label"]}>
            First Name
          </label>
          <input
            type="text"
            name="first-name"
            id="first-name"
            value={firstName}
            onChange={(e) => dispatch(setFirstName(e.target.value))}
            required
          />
        </div>
        <div>
          <label htmlFor="last-name" className={styles["input-label"]}>
            Last Name
          </label>
          <input
            type="text"
            name="last-name"
            id="last-name"
            value={lastName}
            onChange={(e) => dispatch(setLastName(e.target.value))}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className={styles["input-label"]}>
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => dispatch(setEmail(e.target.value))}
            required
          />
        </div>
        <div>
          <label htmlFor="company" className={styles["input-label"]}>
            Union/Organization
          </label>
          <input
            type="text"
            name="company"
            id="company"
            value={company}
            onChange={(e) => dispatch(setCompany(e.target.value))}
            required
          />
        </div>
        <div>
          <label htmlFor="local" className={styles["input-label"]}>
            Union Local
          </label>
          <input
            type="text"
            name="local"
            id="local"
            value={local}
            onChange={(e) => dispatch(setLocal(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="phone" className={styles["input-label"]}>
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={phone}
            onChange={(e) => dispatch(setPhone(e.target.value))}
          />
        </div>
        <div className={styles["comments-container"]}>
          <label htmlFor="comments" className={styles["input-label"]}>
            Comments/Questions
          </label>
          <div className={styles["comments-subcontainer"]}>
            <textarea
              name="comments"
              id="comments"
              rows={6}
              value={comments}
              onChange={(e) => dispatch(setComments(e.target.value))}
            ></textarea>
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
