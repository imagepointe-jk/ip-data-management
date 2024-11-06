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

export function ViewControls() {
  const { selectedView, selectedProductData } = useEditorSelectors();
  const cart = useSelector((store: StoreType) => store.cart.present);
  const viewData = findViewInProductData(selectedProductData, selectedView.id);
  const dispatch = useDispatch();

  return (
    <div
      className={`${styles["floating-container"]} ${styles["view-controls-main"]}`}
    >
      {!viewData && <>Invalid view</>}
      {viewData && (
        <>
          <button onClick={() => dispatch(selectPreviousView({ cart }))}>
            <FontAwesomeIcon icon={faChevronLeft} size={"2x"} />
          </button>
          <div>{viewData.name} View</div>
          <button onClick={() => dispatch(selectNextView({ cart }))}>
            <FontAwesomeIcon icon={faChevronRight} size={"2x"} />
          </button>
        </>
      )}
    </div>
  );
}
