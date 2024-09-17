import styles from "@/styles/customizer/CustomProductDesigner/sidebar.module.css";
import stylesMain from "@/styles/customizer/CustomProductDesigner/main.module.css";
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
import { setDialogOpen, useEditorSelectors } from "../redux/slices/editor";
import { ActionCreators } from "redux-undo";
import { forceClientDownloadBlob } from "@/utility/misc";
import { getRenderedVariationViews } from "@/fetch/client/customizer";
import { TextEditor } from "./text/TextEditor";

export function Sidebar() {
  const dialogOpen = useSelector(
    (state: StoreType) => state.editorState.dialogOpen
  );
  const dispatch = useDispatch();
  const { selectedVariation } = useEditorSelectors();

  async function downloadDesign() {
    try {
      const response = await getRenderedVariationViews(selectedVariation);
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }
      const blob = await response.blob();
      forceClientDownloadBlob(blob, "my-design");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={stylesMain["side-container"]}>
      <div className={`${styles["main"]} ${stylesMain["floating-container"]}`}>
        <button onClick={() => dispatch(setDialogOpen("designs"))}>
          <FontAwesomeIcon icon={faStar} size={"2x"} />
          <div>Designs</div>
        </button>
        <button onClick={() => dispatch(setDialogOpen("colors"))}>
          <FontAwesomeIcon icon={faPaintBrush} size={"2x"} />
          <div>Colors</div>
        </button>
        <button onClick={() => dispatch(setDialogOpen("upload"))}>
          <FontAwesomeIcon icon={faCloudArrowUp} size={"2x"} />
          <div>My Art</div>
        </button>
        <button onClick={() => dispatch(setDialogOpen("text"))}>
          <div className={styles["text-button-t"]}>T</div>
          <div>Text</div>
        </button>
        <button onClick={() => dispatch(ActionCreators.undo())}>Undo</button>
        <button onClick={() => dispatch(ActionCreators.redo())}>Redo</button>
        <button onClick={downloadDesign}>Download Design</button>
      </div>
      {dialogOpen !== null && (
        <div
          className={`${stylesMain["dialog"]} ${stylesMain["floating-container"]}`}
        >
          {dialogOpen === "colors" && <ColorPicker />}
          {dialogOpen === "designs" && <DesignPicker />}
          {dialogOpen === "upload" && <UserUploads />}
          {dialogOpen === "text" && <TextEditor />}
          <button
            className={stylesMain["dialog-x"]}
            onClick={() => dispatch(setDialogOpen(null))}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}
    </div>
  );
}
