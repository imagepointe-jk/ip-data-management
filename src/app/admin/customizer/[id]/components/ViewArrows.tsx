import { wrap } from "@/utility/misc";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { ViewDTO } from "@/types/dto/customizer";

type ViewArrowsProps = {
  views: ViewDTO[];
  selectedViewId: number | undefined;
  setViewId: Dispatch<SetStateAction<number | undefined>>;
};
export function ViewArrows({
  setViewId,
  views,
  selectedViewId,
}: ViewArrowsProps) {
  function onClickViewArrow(direction: "left" | "right") {
    if (views.length === 0) return;

    const curViewIndex = views.findIndex((view) => view.id === selectedViewId);

    let newViewIndex =
      direction === "left" ? curViewIndex - 1 : curViewIndex + 1;
    newViewIndex = wrap(newViewIndex, 0, views.length - 1);

    const newViewId = views[newViewIndex]?.id;
    setViewId(newViewId);
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
