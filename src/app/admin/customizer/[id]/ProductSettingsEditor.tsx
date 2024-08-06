"use client";

import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { FullProductSettings } from "@/db/access/customizer";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

type Props = {
  settings: FullProductSettings;
};
export default function ProductSettingsEditor({ settings }: Props) {
  const [variationIndex, setVariationIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0);
  const errors: string[] = [];

  const variation = settings.variations[variationIndex];
  if (!variation) errors.push(`Variation index ${variationIndex} not found.`);

  const view = variation?.views[viewIndex];
  if (!view)
    errors.push(
      `View index ${viewIndex} of variation index ${variationIndex} not found.`
    );

  return (
    <div className={styles["main-flex"]}>
      <div className={styles["variations-column"]}>
        Variations
        {settings.variations.map((variation, i) => (
          <button key={i}>{variation.color.name}</button>
        ))}
        <button className={styles["add-variation"]}>+</button>
      </div>
      <div className={styles["editor-area"]}>
        <div className={styles["variation-swatch-container"]}>
          <span
            className={styles["variation-swatch"]}
            style={{
              backgroundColor: `#${variation?.color.hexCode || "ffffff"}`,
            }}
          ></span>{" "}
          Variation Color
        </div>
        <div className={styles["view-arrows-container"]}>
          <button
            className={`${styles["view-arrow"]} ${styles["view-arrow-left"]}`}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className={`${styles["view-arrow"]} ${styles["view-arrow-right"]}`}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <div className={styles["product-view-frame"]}>
            <img
              src={view?.imageUrl || IMAGE_NOT_FOUND_URL}
              className={styles["product-view-img"]}
            />
          </div>
        </div>
        {errors.length > 0 && (
          <div className={styles["error"]}>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
