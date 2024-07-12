"use client";

import { FullGarmentSettings } from "@/db/access/customizer";
import styles from "@/styles/CustomGarmentEditor.module.css";

type Props = {
  settings: FullGarmentSettings;
};
export default function GarmentSettingsEditor({ settings }: Props) {
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
