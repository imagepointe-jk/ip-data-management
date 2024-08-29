import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import {
  faCloudArrowUp,
  faPaintBrush,
  faStar,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColorPicker } from "./ColorPicker";
import { DesignPicker } from "./designs/DesignPicker";
import { UserUploads } from "./UserUploads";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import { setDialogOpen } from "../redux/slices/editor";

export function Sidebar() {
  const dialogOpen = useSelector(
    (state: StoreType) => state.editorState.dialogOpen
  );
  const dispatch = useDispatch();

  return (
    <div className={styles["side-container"]}>
      <div className={`${styles["sidebar"]} ${styles["floating-container"]}`}>
        <button
          className={styles["sidebar-button"]}
          onClick={() => dispatch(setDialogOpen("designs"))}
        >
          <FontAwesomeIcon icon={faStar} size={"2x"} />
          <div>Designs</div>
        </button>
        <button
          className={styles["sidebar-button"]}
          onClick={() => dispatch(setDialogOpen("colors"))}
        >
          <FontAwesomeIcon icon={faPaintBrush} size={"2x"} />
          <div>Colors</div>
        </button>
        <button
          className={styles["sidebar-button"]}
          onClick={() => dispatch(setDialogOpen("upload"))}
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
            onClick={() => dispatch(setDialogOpen(null))}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}
    </div>
  );
}
