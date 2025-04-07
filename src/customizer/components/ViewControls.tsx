import {
  selectNextView,
  selectPreviousView,
  useEditorSelectors,
} from "../redux/slices/editor";
import styles from "@/styles/customizer/CustomProductDesigner/main.module.css";
import { findViewInProductData, getAdjacentViewId } from "../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { useEditor } from "../EditorProvider";

export function ViewControls() {
  const { selectedView, selectedVariation, selectedProductData } =
    useEditorSelectors();
  const viewData = findViewInProductData(selectedProductData, selectedView.id);
  const dispatch = useDispatch();
  const { updateViewRender } = useEditor();

  function isDirectionAvailable(direction: "left" | "right") {
    const { viewId: adjacentViewId } = getAdjacentViewId(
      selectedProductData,
      selectedVariation.id,
      selectedView.id,
      direction === "left" ? "previous" : "next"
    );
    const adjacentView = findViewInProductData(
      selectedProductData,
      adjacentViewId
    );
    return adjacentView && adjacentView.locations.length > 0;
  }

  function onClick(direction: "left" | "right") {
    updateViewRender(selectedView.id);
    if (direction === "left") {
      dispatch(selectPreviousView({ productData: selectedProductData }));
    } else {
      dispatch(selectNextView({ productData: selectedProductData }));
    }
  }

  return (
    <div
      className={`${styles["floating-container"]} ${styles["view-controls-main"]}`}
    >
      {!viewData && <>Invalid view</>}
      {viewData && (
        <>
          <button
            onClick={() => onClick("left")}
            disabled={!isDirectionAvailable("left")}
          >
            <FontAwesomeIcon icon={faChevronLeft} size={"2x"} />
          </button>
          <div>{viewData.name} View</div>
          <button
            onClick={() => onClick("right")}
            disabled={!isDirectionAvailable("right")}
          >
            <FontAwesomeIcon icon={faChevronRight} size={"2x"} />
          </button>
        </>
      )}
    </div>
  );
}
