import styles from "@/styles/customizer/CustomProductDesigner/designPicker.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { wrap } from "@/utility/misc";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useDispatch } from "react-redux";
import { addDesign } from "@/customizer/redux/slices/cart";
import {
  setDialogOpen,
  setSelectedEditorGuid,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import {
  DesignWithIncludesSerializable,
  useDesignDataSelector,
} from "@/customizer/redux/slices/designData";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { v4 as uuidv4 } from "uuid";

type Props = {
  design: DesignWithIncludesSerializable;
};
export function DesignCard({ design }: Props) {
  const [viewIndex, setViewIndex] = useState(0); //0 is parent design, greater than 0 is variations (so 1 is variations[0])
  const dispatch = useDispatch();
  const designData = useDesignDataSelector();
  const { selectedProductData } = useEditorSelectors();
  const selectedLocationId = useSelector(
    (store: StoreType) => store.editorState.selectedLocationId
  );
  const imageUrl =
    viewIndex === 0
      ? design.imageUrl
      : design.variations[viewIndex - 1]?.imageUrl;
  const bgColor =
    viewIndex === 0
      ? design.defaultBackgroundColor.hexCode
      : design.variations[viewIndex - 1]?.color.hexCode;

  function onClickAdd() {
    const variationId =
      viewIndex > 0 ? design.variations[viewIndex - 1]?.id : undefined;
    const newGuid = uuidv4();
    dispatch(
      addDesign({
        designId: design.id,
        variationId,
        targetLocationId: selectedLocationId,
        designData: designData.designs,
        targetProductData: selectedProductData,
        newGuid,
      })
    );
    dispatch(setDialogOpen(null));
    dispatch(setSelectedEditorGuid(newGuid));
  }

  function onClickArrow(direction: "left" | "right") {
    if (design.variations.length === 0) return;

    const incremented = direction === "left" ? viewIndex - 1 : viewIndex + 1;
    setViewIndex(wrap(incremented, 0, design.variations.length));
  }

  return (
    <div className={styles["card"]}>
      <div className={styles["img-container"]}>
        <img
          className={styles["contained-img"]}
          src={imageUrl || IMAGE_NOT_FOUND_URL}
          style={{
            backgroundColor: `#${bgColor}`,
          }}
        />
        <button className={styles["add-button"]} onClick={onClickAdd}>
          + Add
        </button>
        {design.variations.length > 0 && (
          <>
            <div className={styles["variations-notification"]}>
              {design.variations.length + 1} variations
            </div>
            <button
              className={`${styles["card-arrow"]} ${styles["card-arrow-left"]}`}
              onClick={() => onClickArrow("left")}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={`${styles["card-arrow"]} ${styles["card-arrow-right"]}`}
              onClick={() => onClickArrow("right")}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}
      </div>
      <div>{design.designNumber}</div>
    </div>
  );
}
