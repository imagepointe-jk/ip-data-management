import { DesignWithIncludes } from "@/types/schema/designs";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
// import { useEditor } from "../../EditorProvider";
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
} from "@/customizer/redux/slices/editor";

type Props = {
  design: DesignWithIncludes;
};
export function DesignCard({ design }: Props) {
  // const { addDesign, setDialogOpen, setSelectedEditorGuid } = useEditor();
  const [viewIndex, setViewIndex] = useState(0); //0 is parent design, greater than 0 is variations (so 1 is variations[0])
  const dispatch = useDispatch();
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
    dispatch(addDesign({ designId: design.id, variationId }));
    // dispatch(setDialogOpen(null));
    // dispatch(setSelectedEditorGuid(added.editorGuid));
  }

  function onClickArrow(direction: "left" | "right") {
    if (design.variations.length === 0) return;

    const incremented = direction === "left" ? viewIndex - 1 : viewIndex + 1;
    setViewIndex(wrap(incremented, 0, design.variations.length));
  }

  return (
    <div className={styles["design-card"]}>
      <div className={styles["design-img-container"]}>
        <img
          className={styles["contained-img"]}
          src={imageUrl || IMAGE_NOT_FOUND_URL}
          style={{
            backgroundColor: `#${bgColor}`,
          }}
        />
        <button className={styles["design-add-button"]} onClick={onClickAdd}>
          + Add
        </button>
        {design.variations.length > 0 && (
          <>
            <div className={styles["design-variations-notification"]}>
              {design.variations.length + 1} variations
            </div>
            <button
              className={`${styles["design-card-arrow"]} ${styles["design-card-arrow-left"]}`}
              onClick={() => onClickArrow("left")}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={`${styles["design-card-arrow"]} ${styles["design-card-arrow-right"]}`}
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
