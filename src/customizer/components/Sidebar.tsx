import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import {
  faCloudArrowUp,
  faPaintBrush,
  faStar,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColorPicker } from "./ColorPicker";
import { useEditor } from "../EditorProvider";
import { DesignPicker } from "./designs/DesignPicker";
import { UserUploads } from "./UserUploads";

export function Sidebar() {
  const { dialogOpen, setDialogOpen } = useEditor();

  return (
    <div className={styles["side-container"]}>
      <div className={`${styles["sidebar"]} ${styles["floating-container"]}`}>
        <button
          className={styles["sidebar-button"]}
          onClick={() => setDialogOpen("designs")}
        >
          <FontAwesomeIcon icon={faStar} size={"2x"} />
          <div>Designs</div>
        </button>
        <button
          className={styles["sidebar-button"]}
          onClick={() => setDialogOpen("colors")}
        >
          <FontAwesomeIcon icon={faPaintBrush} size={"2x"} />
          <div>Colors</div>
        </button>
        <button
          className={styles["sidebar-button"]}
          onClick={() => setDialogOpen("upload")}
        >
          <FontAwesomeIcon icon={faCloudArrowUp} size={"2x"} />
          <div>My Art</div>
        </button>
      </div>
      {dialogOpen !== null && (
        <div className={`${styles["dialog"]} ${styles["floating-container"]}`}>
          {dialogOpen === "colors" && <ColorPicker />}
          {dialogOpen === "designs" && <DesignPicker />}
          {dialogOpen === "upload" && <UserUploads />}
          <button
            className={styles["dialog-x"]}
            onClick={() => setDialogOpen(null)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}
    </div>
  );
}
