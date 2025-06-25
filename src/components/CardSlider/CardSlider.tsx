"use client";
// import { Arrow3 } from "@/components/icons/Arrow3";
import styles from "@/styles/CardSlider.module.css";
import { clamp } from "@/utility/misc";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import throttle from "lodash.throttle";
import { ReactNode, useEffect, useRef, useState } from "react";

//this slider takes the visibility of cards into account when sliding. this allows for more intuitive behavior in some cases.
//however, it also means the slider position does not derive from a simple "index" variable, since it can slide to positions between cards.
type HasId = {
  id: number | string;
};
type Props<T> = {
  cardContainerClassName?: string;
  cardClassName?: string;
  slidingParentClassName?: string;
  dataset: T[];
  createCard: (data: T) => ReactNode;
};
//the main container gets a max-width set based on the number of cards, to reduce unused space.
//the max-width will not be set larger than the following number of cards.
const maxFittingCount = 4;
export function CardSlider<T extends HasId>({
  dataset,
  createCard,
  cardContainerClassName,
  cardClassName,
  slidingParentClassName,
}: Props<T>) {
  const mainRef = useRef(null as HTMLDivElement | null);
  const [canMoveLeft, setCanMoveLeft] = useState(false);
  const [canMoveRight, setCanMoveRight] = useState(false);
  const [maxWidth, setMaxWidth] = useState(undefined as string | undefined);
  const onClickArrowThrottled = throttle(
    (direction: "left" | "right") => {
      if (!mainRef.current) return;

      const mainBoundingRect = mainRef.current.getBoundingClientRect();
      const slidingContainer = mainRef.current.children[0] as HTMLElement;
      if (!slidingContainer) return;

      const offsets = calculateOffsets(
        direction,
        mainBoundingRect,
        slidingContainer
      );

      if (offsets?.newOffset !== null)
        slidingContainer.style.left = `${offsets?.newOffset}px`;

      //movement ability depends on which cards are fully visible, which changes during the transition animation.
      //wait until the transition is over to recalculate which directions we can move.
      setTimeout(() => {
        setCanMoveLeft(canMoveInDirection("left"));
        setCanMoveRight(canMoveInDirection("right"));
      }, 1200);
    },
    1200,
    {
      trailing: false,
    }
  );

  function getFirstCardWidth() {
    return (
      mainRef.current?.children[0]?.children[0]?.getBoundingClientRect()
        .width || 0
    );
  }

  function canMoveInDirection(direction: "left" | "right") {
    if (!mainRef.current) return false;

    const mainBoundingRect = mainRef.current.getBoundingClientRect();
    const slidingContainer = mainRef.current.children[0] as HTMLElement;
    const offsets = calculateOffsets(
      direction,
      mainBoundingRect,
      slidingContainer
    );

    return offsets?.newOffset !== offsets?.curOffset;
  }

  function calculateOffsets(
    moveDirection: "left" | "right",
    mainBoundingRect: DOMRect,
    slidingContainer: HTMLElement
  ) {
    const firstCard = slidingContainer.children[0];
    if (!firstCard) return;

    //figure out which of the card containers are fully visible (have all their pixels within the parent container)
    const cardContainerFullVisibilities = Array.from(
      slidingContainer.children
    ).map((element) => {
      const boundingRect = element.getBoundingClientRect();

      return {
        element,
        fullyVisible:
          boundingRect.left >= mainBoundingRect.left &&
          boundingRect.right <= mainBoundingRect.right,
      };
    });

    //if moving left, we'll want the first not-fully-visible container in the opposite direction
    if (moveDirection === "left") cardContainerFullVisibilities.reverse();

    //check one at a time in the given direction until we find the first container that isn't fully visible
    const firstNotFullyVisibleContainer = cardContainerFullVisibilities.find(
      (cardVisibility, i, arr) => {
        const prevCardVisibility = arr[i - 1];
        return !cardVisibility.fullyVisible && prevCardVisibility?.fullyVisible;
      }
    );

    //if there are no more containers to be revealed in the given direction, refuse to scroll more
    if (!firstNotFullyVisibleContainer) return null;

    //calculate the + or - distance to move from current offset
    const distToMove =
      moveDirection === "left"
        ? mainBoundingRect.right -
          firstNotFullyVisibleContainer.element.getBoundingClientRect().right
        : mainBoundingRect.left -
          firstNotFullyVisibleContainer.element.getBoundingClientRect().left;

    //clamp to prevent scrolling past end of cards
    const cardWidth = getFirstCardWidth();
    const minOffset = clamp(
      mainBoundingRect.width - cardWidth * slidingContainer.children.length,
      Number.MIN_SAFE_INTEGER,
      0
    );
    const curOffset = +slidingContainer.style.left.replace("px", "");
    const newOffset = clamp(curOffset + distToMove, minOffset, 0);

    return { curOffset, newOffset };
  }

  useEffect(() => {
    if (!mainRef.current) return;

    const totalCards = mainRef.current.children[0]?.children.length || 0;
    const maxWidth = `${clamp(
      getFirstCardWidth() * totalCards,
      0,
      getFirstCardWidth() * maxFittingCount
    )}px`;
    setMaxWidth(maxWidth);

    setCanMoveLeft(canMoveInDirection("left"));
    setCanMoveRight(canMoveInDirection("right"));
  }, [mainRef]);

  return (
    <div className={styles["main"]}>
      <div
        className={`${styles["sliding-parent"]} ${
          slidingParentClassName || ""
        }`}
        ref={mainRef}
        style={{ maxWidth }}
      >
        <div className={styles["sliding-container"]} style={{ left: "0" }}>
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
      {canMoveLeft && (
        <button
          className={`${styles["arrow-button"]} ${styles["arrow-icon-left"]} ${
            !canMoveLeft ? styles["disabled"] : ""
          }`}
          onClick={() => onClickArrowThrottled("left")}
          aria-label="scroll gallery left"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          {/* <Arrow3 size={18} /> */}
        </button>
      )}
      {canMoveRight && (
        <button
          className={`${styles["arrow-button"]} ${styles["arrow-icon-right"]} ${
            !canMoveRight ? styles["disabled"] : ""
          }`}
          onClick={() => onClickArrowThrottled("right")}
          aria-label="scroll gallery right"
        >
          <FontAwesomeIcon icon={faChevronRight} />
          {/* <Arrow3 size={18} /> */}
        </button>
      )}
    </div>
  );
}
