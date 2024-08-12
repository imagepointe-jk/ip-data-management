"use client";

import { useState } from "react";
import { useEditor } from "../../EditorContext";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { getArrayPage } from "@/utility/misc";
import { PageControls } from "@/components/PageControls";

const pageSize = 20;

export function DesignPicker() {
  const { designResults } = useEditor();
  const [page, setPage] = useState(1);
  const resultsPage = getArrayPage(designResults.designs, page, pageSize);
  const totalPages = Math.ceil(designResults.totalResults / pageSize);

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
      <div>
        <PageControls
          curItemsPerPage={pageSize}
          curPageNumber={page}
          totalPages={totalPages}
          showJumpTo={false}
          buttonOverrides={{
            onClickPageNumber: (clicked) => setPage(clicked),
          }}
          mainClassName={styles["design-page-numbers"]}
          buttonClassName={styles["page-button"]}
          activeButtonClassName={`${styles["page-button"]} ${styles["current"]}`}
        />
      </div>
    </div>
  );
}
