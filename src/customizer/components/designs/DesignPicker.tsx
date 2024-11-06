"use client";

import { PageControls } from "@/components/PageControls";
import {
  DesignResultsSerializable,
  DesignWithIncludesSerializable,
  useDesignDataSelector,
} from "@/customizer/redux/slices/designData";
import styles from "@/styles/customizer/CustomProductDesigner/designPicker.module.css";
import { getArrayPage } from "@/utility/misc";
import { useState } from "react";
import { DesignCard } from "./DesignCard";

const pageSize = 20;

export function DesignPicker() {
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
          className={styles["search"]}
          type="text"
          placeholder="Search designs..."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div>
      <div className={styles["results"]}>
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
          mainClassName={styles["page-numbers"]}
          buttonClassName={styles["page-button"]}
          activeButtonClassName={`${styles["page-button"]} ${styles["current"]}`}
        />
      </div>
    </div>
  );
}

//small client-side filter function since we're currently getting all design data at once
function filterDesigns(
  designResults: DesignResultsSerializable,
  search?: string
) {
  const filtered: DesignWithIncludesSerializable[] =
    designResults.designs.filter((design) => {
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
    });

  return filtered;
}
