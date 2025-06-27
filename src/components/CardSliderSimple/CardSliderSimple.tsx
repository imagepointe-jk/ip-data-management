"use client";
import { Dots } from "@/app/iframe-components/subcomponents/Dots";
import styles from "@/styles/CardSliderSimple.module.css";
import { clamp, wrap } from "@/utility/misc";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useRef, useState } from "react";

//this is a simpler version of CardSlider that ignores visibility of cards and instead slides based on a single "index" variable.
//this simplifies the logic and allows for useful functionality like onChangeIndex callbacks and overriding the index from outside.
type HasId = {
  id: number | string;
};
type EndBehavior = "prevent" | "rewind";
type Props<T> = {
  className?: string;
  cardContainerClassName?: string;
  cardClassName?: string;
  slidingParentClassName?: string;
  buttonClassName?: string;
  indexOverride?: number;
  onChangeIndex?: (index: number) => void;
  dataset: T[];
  createCard: (data: T) => ReactNode;
  dotClassNameActive?: string;
  dotClassNameInactive?: string;
  endBehavior?: EndBehavior; //behavior to use when the user has reached the start or end of the collection and tries to keep scrolling in the same direction
};
export function CardSliderSimple<T extends HasId>({
  dataset,
  className,
  createCard,
  cardContainerClassName,
  cardClassName,
  slidingParentClassName,
  buttonClassName,
  indexOverride,
  onChangeIndex,
  dotClassNameInactive,
  dotClassNameActive,
  endBehavior,
}: Props<T>) {
  const slidingContainerRef = useRef(null as HTMLDivElement | null);
  const [index, setIndex] = useState(0);
  const indexToUse =
    indexOverride !== undefined
      ? clamp(indexOverride, 0, dataset.length - 1)
      : index;
  const endBehaviorToUse: EndBehavior =
    endBehavior === undefined ? "prevent" : endBehavior;
  const canMoveLeft = indexToUse > 0;
  const canMoveRight = indexToUse < dataset.length - 1;
  const offset = getCardWidth() * -1 * indexToUse;

  function getCardWidth() {
    if (!slidingContainerRef.current) return 0;

    //assume all cards are same width
    return (
      slidingContainerRef.current.children[0]?.getBoundingClientRect().width ||
      0
    );
  }

  function onClickArrow(direction: "left" | "right") {
    const increment = direction === "left" ? -1 : 1;
    const newIndex =
      endBehaviorToUse === "prevent"
        ? clamp(indexToUse + increment, 0, dataset.length - 1)
        : wrap(indexToUse + increment, 0, dataset.length - 1);

    if (onChangeIndex) onChangeIndex(newIndex);
    else setIndex(newIndex);
  }

  return (
    <div className={`${styles["main"]} ${className || ""}`}>
      <div
        className={`${styles["sliding-parent"]} ${
          slidingParentClassName || ""
        }`}
      >
        <div
          className={styles["sliding-container"]}
          style={{ left: `${offset}px` }}
          ref={slidingContainerRef}
        >
          {dataset.map((data) => (
            <div
              key={data.id}
              className={`${styles["card-container"]} ${
                cardContainerClassName || ""
              }`}
            >
              <div className={`${styles["card"]} ${cardClassName || ""}`}>
                {createCard(data)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {(canMoveLeft || endBehaviorToUse !== "prevent") && (
        <button
          className={`${styles["arrow-button"]} ${styles["arrow-icon-left"]} ${
            buttonClassName || ""
          } ${
            !canMoveLeft && endBehaviorToUse === "prevent"
              ? styles["disabled"]
              : ""
          }`}
          onClick={() => onClickArrow("left")}
          aria-label="scroll gallery left"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      {(canMoveRight || endBehaviorToUse !== "prevent") && (
        <button
          className={`${styles["arrow-button"]} ${styles["arrow-icon-right"]} ${
            buttonClassName || ""
          } ${
            !canMoveRight && endBehaviorToUse === "prevent"
              ? styles["disabled"]
              : ""
          }`}
          onClick={() => onClickArrow("right")}
          aria-label="scroll gallery right"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}
      <div className={styles["dots-container"]}>
        <Dots
          activeIndex={indexToUse}
          total={dataset.length}
          dotClassNameInactive={dotClassNameInactive}
          dotClassNameActive={dotClassNameActive}
        />
      </div>
    </div>
  );
}
