"use client";

import { FullProductSettings } from "@/db/access/customizer";
import styles from "@/styles/CustomProductEditor.module.css";

type Props = {
  settings: FullProductSettings;
};
export default function ProductSettingsEditor({ settings }: Props) {
  return (
    <div className={styles["main-flex"]}>
      <div>
        {settings.variations.map((variation, i) => (
          <button key={i}>{variation.color.name}</button>
        ))}
      </div>
    </div>
  );
}
