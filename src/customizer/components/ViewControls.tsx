import { useSelector } from "react-redux";
import {
  selectNextView,
  selectPreviousView,
  useEditorSelectors,
} from "../redux/slices/editor";
import styles from "@/styles/customizer/CustomProductDesigner/main.module.css";
import { StoreType } from "../redux/store";
import { findViewInProductData } from "../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { useEditor } from "../EditorProvider";

export function ViewControls() {
  const { selectedView, selectedProductData } = useEditorSelectors();
  const cart = useSelector((store: StoreType) => store.cart.present);
  const viewData = findViewInProductData(selectedProductData, selectedView.id);
  const dispatch = useDispatch();
  const { updateViewRender } = useEditor();

  function onClick(direction: "left" | "right") {
    updateViewRender(selectedView.id);
    if (direction === "left") {
      dispatch(selectPreviousView({ cart }));
    } else {
      dispatch(selectNextView({ cart }));
    }
  }

  return (
    <div
      className={`${styles["floating-container"]} ${styles["view-controls-main"]}`}
    >
      {!viewData && <>Invalid view</>}
      {viewData && (
        <>
          <button onClick={() => onClick("left")}>
            <FontAwesomeIcon icon={faChevronLeft} size={"2x"} />
          </button>
          <div>{viewData.name} View</div>
          <button onClick={() => onClick("right")}>
            <FontAwesomeIcon icon={faChevronRight} size={"2x"} />
          </button>
        </>
      )}
    </div>
  );
}
