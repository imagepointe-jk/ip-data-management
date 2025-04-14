import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";

export function CartSuccessStep() {
  return (
    <div className={styles["success-container"]}>
      <FontAwesomeIcon
        icon={faCircleCheck}
        size="3x"
        className={styles["success-check"]}
      />
      <h2>Quote Request Sent</h2>
      <p>A member of our sales team will reach out to you soon.</p>
    </div>
  );
}
