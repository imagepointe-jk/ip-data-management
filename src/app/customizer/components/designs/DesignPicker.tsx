"use client";

import { useState } from "react";
import { useEditor } from "../../EditorContext";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { getArrayPage } from "@/utility/misc";
import { PageControls } from "@/components/PageControls";
import { DesignResults, DesignWithIncludes } from "@/types/types";

const pageSize = 20;

export function DesignPicker() {
  const { designResults, addDesign, setDialogOpen, setSelectedEditorGuid } =
    useEditor();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const filtered = filterDesigns(designResults, search);
  const resultsPage = getArrayPage(filtered, page, pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  function onClickDesignCard(designId: number) {
    const added = addDesign(designId);
    setDialogOpen(null);
    setSelectedEditorGuid(added.editorGuid);
  }

  return (
    <div>
      <div>
        <input
          className={styles["design-search"]}
          type="text"
          placeholder="Search designs..."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div>
      <div className={styles["design-results"]}>
        {resultsPage.map((design) => (
          <div key={design.id} className={styles["design-card"]}>
            <div
              className={styles["design-img-container"]}
              onClick={() => onClickDesignCard(design.id)}
            >
              <img
                className={styles["contained-img"]}
                src={design.imageUrl}
                style={{
                  backgroundColor: `#${design.defaultBackgroundColor.hexCode}`,
                }}
              />
              <button className={styles["design-add-button"]}>+ Add</button>
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

//small client-side filter function since we're currently getting all design data at once
function filterDesigns(designResults: DesignResults, search?: string) {
  const filtered: DesignWithIncludes[] = designResults.designs.filter(
    (design) => {
      const subcategoryNames = design.designSubcategories.map(
        (sub) => sub.name
      );
      const tagNames = design.designTags.map((tag) => tag.name);
      const searchable = [
        ...subcategoryNames,
        ...tagNames,
        design.designNumber,
      ];
      return search
        ? !!searchable.find((str) =>
            str.toLocaleLowerCase().startsWith(search.toLocaleLowerCase())
          )
        : true;
    }
  );

  return filtered;
}
