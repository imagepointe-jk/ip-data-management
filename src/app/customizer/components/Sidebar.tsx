import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { faPaintBrush, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Sidebar() {
  return (
    <div className={styles["sidebar"]}>
      <button className={styles["sidebar-button"]}>
        <FontAwesomeIcon icon={faStar} size={"2x"} />
        <div>Designs</div>
      </button>
      <button className={styles["sidebar-button"]}>
        <FontAwesomeIcon icon={faPaintBrush} size={"2x"} />
        <div>Colors</div>
      </button>
    </div>
  );
}
