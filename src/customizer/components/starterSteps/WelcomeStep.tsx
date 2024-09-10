import styles from "@/styles/customizer/CustomProductDesigner/starterStep.module.css";
import { fa1, fa2, fa3 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function WelcomeStep() {
  return (
    <>
      <h1>Welcome</h1>
      <div className={styles["instructions-container"]}>
        <div className={styles["instruction-row"]}>
          <FontAwesomeIcon icon={fa1} size="2x" />
          <div>Select a product</div>
        </div>
        <div className={styles["instruction-row"]}>
          <FontAwesomeIcon icon={fa2} size="2x" />
          <div>Select a color</div>
        </div>
        <div className={styles["instruction-row"]}>
          <FontAwesomeIcon icon={fa3} size="2x" />
          <div>Start Designing!</div>
        </div>
      </div>
    </>
  );
}
