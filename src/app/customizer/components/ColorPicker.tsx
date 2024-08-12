"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useEditor } from "../EditorContext";

export function ColorPicker() {
  const { selectedProductData } = useEditor();
  const productColors =
    selectedProductData?.variations.map((variation) => variation.color) || [];

  return (
    <div className={styles["color-choices-container"]}>
      {productColors.map((color) => (
        <button key={color.id} className={styles["color-choice"]}>
          <div
            className={styles["color-choice-swatch"]}
            style={{ backgroundColor: `#${color.hexCode}` }}
          ></div>
          <div>{color.name}</div>
        </button>
      ))}
    </div>
  );
}
