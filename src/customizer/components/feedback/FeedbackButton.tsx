import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "@/styles/customizer/CustomProductDesigner/feedback.module.css";
import { useDispatch } from "react-redux";
import { setModalOpen } from "@/customizer/redux/slices/editor";

export function FeedbackButton() {
  const dispatch = useDispatch();

  return (
    <button
      className={styles["feedback-button"]}
      onClick={() => dispatch(setModalOpen("feedback"))}
    >
      <div className={styles["feedback-label"]}>Feedback</div>
      <FontAwesomeIcon icon={faComment} />
    </button>
  );
}
