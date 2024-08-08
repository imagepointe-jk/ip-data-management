import { wrap } from "@/utility/misc";
import { CustomProductView } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

type ViewArrowsProps = {
  views: CustomProductView[];
  selectedViewIndex: number;
  setViewIndex: Dispatch<SetStateAction<number>>;
};
export function ViewArrows({
  setViewIndex,
  views,
  selectedViewIndex,
}: ViewArrowsProps) {
  function onClickViewArrow(direction: "left" | "right") {
    if (views.length === 0) return;

    let newViewIndex =
      direction === "left" ? selectedViewIndex - 1 : selectedViewIndex + 1;
    newViewIndex = wrap(newViewIndex, 0, views.length - 1);

    setViewIndex(newViewIndex);
  }

  return (
    <div className={styles["view-arrows-container"]}>
      <button
        className={`${styles["view-arrow"]} ${styles["view-arrow-left"]}`}
        onClick={() => onClickViewArrow("left")}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        className={`${styles["view-arrow"]} ${styles["view-arrow-right"]}`}
        onClick={() => onClickViewArrow("right")}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}
