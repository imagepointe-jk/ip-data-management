import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { faPaintBrush, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColorPicker } from "./ColorPicker";
import { useEditor } from "../EditorContext";

export function Sidebar() {
  const { dialogOpen } = useEditor();

  return (
    <div className={styles["side-container"]}>
      <div className={`${styles["sidebar"]} ${styles["floating-container"]}`}>
        <button className={styles["sidebar-button"]}>
          <FontAwesomeIcon icon={faStar} size={"2x"} />
          <div>Designs</div>
        </button>
        <button className={styles["sidebar-button"]}>
          <FontAwesomeIcon icon={faPaintBrush} size={"2x"} />
          <div>Colors</div>
        </button>
      </div>
      {dialogOpen !== null && (
        <div className={`${styles["dialog"]} ${styles["floating-container"]}`}>
          {dialogOpen === "colors" && <ColorPicker />}
        </div>
      )}
    </div>
  );
}
