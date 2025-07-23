import { Modal } from "@/components/Modal";
import styles from "@/styles/customizer/CustomProductDesigner/feedback.module.css";
import stylesModal from "@/styles/customizer/CustomProductDesigner/modal.module.css";
import stylesForm from "@/styles/customizer/CustomProductDesigner/forms.module.css";
import { useDispatch } from "react-redux";
import { setModalOpen } from "@/customizer/redux/slices/editor";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { FormEvent, useState } from "react";
import { submitFeedback } from "@/actions/customizer/misc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export function FeedbackModal() {
  const [status, setStatus] = useState<
    "initial" | "submitting" | "error" | "success"
  >("initial");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [feedback, setFeedback] = useState("");
  const dispatch = useDispatch();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    try {
      await submitFeedback({
        firstName,
        lastName,
        email,
        company,
        feedback,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  }

  return (
    <Modal
      windowClassName={stylesModal["modal"]}
      xButtonClassName={stylesModal["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
      windowStyle={{ textAlign: "center", maxWidth: "506px" }}
    >
      {status === "success" && (
        <div className={styles["success-container"]}>
          <FontAwesomeIcon
            icon={faCircleCheck}
            size="3x"
            className={styles["success-check"]}
          />
          <h2>Success</h2>
          <p>Thank you for sharing your feedback!</p>
        </div>
      )}
      {status !== "success" && (
        <form onSubmit={onSubmit}>
          <h2>Feedback</h2>
          <div className={stylesForm["primary-fields"]}>
            <div>
              <label className={stylesForm["input-label"]}>First Name</label>
              <input
                type="text"
                className={stylesForm["form-input"]}
                required={true}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className={stylesForm["input-label"]}>Last Name</label>
              <input
                type="text"
                className={stylesForm["form-input"]}
                required={true}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className={stylesForm["input-label"]}>Email</label>
              <input
                type="email"
                className={stylesForm["form-input"]}
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={stylesForm["input-label"]}>
                Union/Organization
              </label>
              <input
                type="text"
                className={stylesForm["form-input"]}
                required={true}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div>
              <label className={stylesForm["input-label"]}>Feedback</label>
              <textarea
                cols={52}
                rows={7}
                className={styles["feedback-textarea"]}
                required={true}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div>
            {status === "error" && (
              <div style={{ color: "red" }}>
                An error occurred. Please try again later.
              </div>
            )}
            <ButtonWithLoading
              loading={status === "submitting"}
              normalText="Submit"
              className={styles["submit-button"]}
              type="submit"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
