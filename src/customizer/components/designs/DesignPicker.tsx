"use client";

import { useState } from "react";
// import { useEditor } from "../../EditorProvider";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { getArrayPage } from "@/utility/misc";
import { PageControls } from "@/components/PageControls";
import { DesignResults, DesignWithIncludes } from "@/types/schema/designs";
import { DesignCard } from "./DesignCard";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import { useDesignDataSelector } from "@/customizer/redux/slices/designData";

const pageSize = 20;

export function DesignPicker() {
  // const { designResults } = useEditor();
  const designResults = useDesignDataSelector();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const filtered = filterDesigns(designResults, search);
  const resultsPage = getArrayPage(filtered, page, pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

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
          <DesignCard key={design.id} design={design} />
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
