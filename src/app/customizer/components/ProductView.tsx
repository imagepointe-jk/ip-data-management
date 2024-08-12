"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useEditor } from "../EditorContext";

export function ProductView() {
  const { selectedView } = useEditor();

  return (
    <div className={styles["product-view-frame"]}>
      <img
        className={styles["product-view-img"]}
        src={selectedView?.imageUrl || IMAGE_NOT_FOUND_URL}
      />
    </div>
  );
}
