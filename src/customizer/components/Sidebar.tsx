import styles from "@/styles/customizer/CustomProductDesigner/sidebar.module.css";
import stylesMain from "@/styles/customizer/CustomProductDesigner/main.module.css";
import {
  faCloudArrowUp,
  faDownload,
  faPaintBrush,
  faQuestionCircle,
  faRedo,
  faStar,
  faUndo,
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
import { ActionCreators } from "redux-undo";
import { TextEditor } from "./text/TextEditor";
import { Help } from "./Help";
import { DownloadDesign } from "./DownloadDesign";
import { EditorDialog } from "@/types/schema/customizer";
import { ReactNode } from "react";

type Button = {
  text: string;
  iconElement: ReactNode;
  dialogToOpen?: EditorDialog;
  onClickExtra?: () => void; //a function to call on click that doesn't involve opening a dialog
};
export function Sidebar() {
  const dialogOpen = useSelector(
    (state: StoreType) => state.editorState.dialogOpen
  );
  const dispatch = useDispatch();

  const buttons: Button[] = [
    {
      text: "Designs",
      iconElement: <FontAwesomeIcon icon={faStar} size={"2x"} />,
      dialogToOpen: "designs",
    },
    {
      text: "Colors",
      iconElement: <FontAwesomeIcon icon={faPaintBrush} size={"2x"} />,
      dialogToOpen: "colors",
    },
    {
      text: "My Art",
      iconElement: <FontAwesomeIcon icon={faCloudArrowUp} size={"2x"} />,
      dialogToOpen: "upload",
    },
    {
      text: "Text",
      iconElement: <div className={styles["text-button-t"]}>T</div>,
      dialogToOpen: "text",
    },
    {
      text: "Undo",
      iconElement: <FontAwesomeIcon icon={faUndo} size={"2x"} />,
      onClickExtra: () => dispatch(ActionCreators.undo()),
    },
    {
      text: "Redo",
      iconElement: <FontAwesomeIcon icon={faRedo} size={"2x"} />,
      onClickExtra: () => dispatch(ActionCreators.redo()),
    },
    {
      text: "Download Design",
      iconElement: <FontAwesomeIcon icon={faDownload} size={"2x"} />,
      dialogToOpen: "download",
    },
    {
      text: "Help",
      iconElement: <FontAwesomeIcon icon={faQuestionCircle} size={"2x"} />,
      dialogToOpen: "help",
    },
  ];

  return (
    <div className={stylesMain["side-container"]}>
      <div className={`${styles["main"]} ${stylesMain["floating-container"]}`}>
        {buttons.map((button, i) => (
          <button
            key={i}
            className={
              dialogOpen === button.dialogToOpen ? styles["active"] : undefined
            }
            onClick={() => {
              if (button.dialogToOpen)
                dispatch(setDialogOpen(button.dialogToOpen));
              if (button.onClickExtra) button.onClickExtra();
            }}
          >
            {button.iconElement}
            <div>{button.text}</div>
          </button>
        ))}
      </div>
      {dialogOpen !== null && (
        <div
          className={`${stylesMain["dialog"]} ${stylesMain["floating-container"]}`}
        >
          {dialogOpen === "colors" && <ColorPicker />}
          {dialogOpen === "designs" && <DesignPicker />}
          {dialogOpen === "upload" && <UserUploads />}
          {dialogOpen === "text" && <TextEditor />}
          {dialogOpen === "help" && <Help />}
          {dialogOpen === "download" && <DownloadDesign />}
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
