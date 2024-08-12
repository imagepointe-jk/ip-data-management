"use client";

import { useState } from "react";
import { useEditor } from "../../EditorContext";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { getArrayPage } from "@/utility/misc";

export function DesignPicker() {
  const { designResults } = useEditor();
  const [page, setPage] = useState(1);
  const resultsPage = getArrayPage(designResults.designs, page, 10);
  const totalPages = Math.ceil(designResults.totalResults / 10);

  return (
    <div>
      <div className={styles["design-results"]}>
        {resultsPage.map((design) => (
          <div key={design.id} className={styles["design-card"]}>
            <div className={styles["design-img-container"]}>
              <img
                className={styles["contained-img"]}
                src={design.imageUrl}
                style={{
                  backgroundColor: `#${design.defaultBackgroundColor.hexCode}`,
                }}
              />
            </div>
            <div>{design.designNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
