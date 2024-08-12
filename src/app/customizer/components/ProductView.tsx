"use client";

import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";

type Props = {
  imageUrl: string | undefined;
};
export function ProductView({ imageUrl }: Props) {
  return (
    <div className={styles["product-view-frame"]}>
      <img
        className={styles["product-view-img"]}
        src={imageUrl || IMAGE_NOT_FOUND_URL}
      />
    </div>
  );
}
