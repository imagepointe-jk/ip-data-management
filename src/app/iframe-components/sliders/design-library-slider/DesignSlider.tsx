"use client";

import { Color, Design } from "@prisma/client";
import styles from "@/styles/iframe-components/sliders/designLibrarySlider.module.css";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Dots } from "../../subcomponents/Dots";
import { IframeLink } from "@/components/IframeHelper/IframeLink";
import { wrap } from "@/utility/misc";

const MIN_SCALE = 0.8;
type Props = {
  designs: (Design & { defaultBackgroundColor: Color })[];
  finalUrl: string;
};
export function DesignSlider({ designs, finalUrl }: Props) {
  const [offset, setOffset] = useState(0);
  const items: {
    design?: Design & { defaultBackgroundColor: Color };
    singleLink?: string;
  }[] = designs.map((design) => ({
    design,
  }));
  items.push({ singleLink: finalUrl });
  const [viewedIndex, setViewedIndex] = useState(
    Math.floor(designs.length / 2)
  ); //start in the middle of the provided designs
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const slidingContainerRef = useRef<HTMLDivElement | null>(null);
  // const canMoveLeft = viewedIndex > 0;
  // const canMoveRight = viewedIndex < designs.length - 1;

  function calcCardScale(index: number) {
    const distToViewedIndex = Math.abs(viewedIndex - index);
    const result = -0.3 * distToViewedIndex + 1.4;
    return result < MIN_SCALE ? MIN_SCALE : result;
  }

  function onClickButton(direction: "left" | "right") {
    const increment = direction === "left" ? -1 : 1;
    setViewedIndex(wrap(viewedIndex + increment, 0, items.length - 1));
  }

  useEffect(() => {
    if (!mainContainerRef.current || !slidingContainerRef.current) return;

    const mainContainerWidth =
      mainContainerRef.current.getBoundingClientRect().width;
    const firstCard = slidingContainerRef.current?.children[0] as
      | HTMLDivElement
      | undefined;
    const style = firstCard ? getComputedStyle(firstCard) : undefined;
    const splitFlex = `${style?.flex}`.split(" ");
    const widthVal = +`${splitFlex[2]}`.replace("px", "");

    setOffset((mainContainerWidth - widthVal) / 2 - viewedIndex * widthVal);
  }, [viewedIndex]);

  return (
    <div className={styles["main"]} ref={mainContainerRef}>
      <div
        className={styles["sliding-container"]}
        ref={slidingContainerRef}
        style={{ left: `${offset}px` }}
      >
        {items.map((item, i) => (
          <IframeLink
            key={item.design?.id || item.singleLink || i}
            className={`${styles["card"]} ${
              i !== viewedIndex ? styles["not-viewed"] : ""
            } ${item.singleLink ? styles["final-card"] : ""}`}
            href={
              item.singleLink
                ? item.singleLink
                : `https://www.imagepointe.com/design-library/?viewDesign=${item.design?.id}`
            }
            style={{
              scale: calcCardScale(i),
              zIndex: i === viewedIndex ? 1 : 0,
            }}
          >
            {item.design && (
              <img
                src={item.design.imageUrl}
                className={styles["image"]}
                style={{
                  backgroundColor: `#${item.design.defaultBackgroundColor.hexCode}`,
                }}
              />
            )}
            {item.singleLink && (
              <div className={styles["fake-link"]}>View More Designs</div>
            )}
          </IframeLink>
        ))}
      </div>
      <div className={styles["buttons-container"]}>
        <button
          className={styles["button"]}
          onClick={() => onClickButton("left")}
        >
          <FontAwesomeIcon icon={faChevronLeft} size="2x" />
        </button>
        <button
          className={styles["button"]}
          onClick={() => onClickButton("right")}
        >
          <FontAwesomeIcon icon={faChevronRight} size="2x" />
        </button>
      </div>
      <Dots
        total={designs.length + 1}
        activeIndex={viewedIndex}
        className={styles["dots-container"]}
      />
    </div>
  );
}
