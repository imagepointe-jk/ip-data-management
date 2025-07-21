"use client";

import { PageControls } from "@/components/PageControls";
import {
  DesignResultsSerializable,
  DesignWithIncludesSerializable,
  useDesignDataSelector,
} from "@/customizer/redux/slices/designData";
import styles from "@/styles/customizer/CustomProductDesigner/designPicker.module.css";
import { getArrayPage } from "@/utility/misc";
import { DesignCard } from "./DesignCard";
import {
  setDesignBrowserPage,
  setDesignBrowserSearch,
  setDesignBrowserSubcategoryId,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Filters } from "./Filters";

const pageSize = 20;

export function DesignPicker() {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const { designs } = useDesignDataSelector();
  const { designBrowserData } = useEditorSelectors();
  const dispatch = useDispatch();

  const filtered = filterDesigns(
    designs,
    designBrowserData.subcategoryId,
    designBrowserData.search
  );
  const resultsPage = getArrayPage(filtered, designBrowserData.page, pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const showClearFiltersButton = designBrowserData.subcategoryId !== null;

  function onClickClearFilters() {
    dispatch(setDesignBrowserSubcategoryId(null));
  }

  return (
    <div>
      <div className={styles["browse-tools-container"]}>
        <input
          className={styles["search"]}
          type="text"
          placeholder="Search designs..."
          onChange={(e) => dispatch(setDesignBrowserSearch(e.target.value))}
          onFocus={() => setFiltersExpanded(false)}
          value={designBrowserData.search}
        />
        <button onClick={() => setFiltersExpanded(!filtersExpanded)}>
          <FontAwesomeIcon icon={faSliders} />
          {" Filters"}
        </button>
        {showClearFiltersButton && (
          <button
            className={styles["clear-filters"]}
            onClick={onClickClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
      {filtersExpanded && (
        <Filters closeFilters={() => setFiltersExpanded(false)} />
      )}
      {!filtersExpanded && filtered.length > 0 && (
        <div className={styles["results"]}>
          {resultsPage.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
      {!filtersExpanded && filtered.length === 0 && (
        <div className={styles["no-results"]}>No results.</div>
      )}
      {!filtersExpanded && filtered.length > 0 && (
        <div>
          <PageControls
            curItemsPerPage={pageSize}
            curPageNumber={designBrowserData.page}
            totalPages={totalPages}
            showJumpTo={false}
            buttonOverrides={{
              onClickPageNumber: (clicked) =>
                dispatch(setDesignBrowserPage(clicked)),
            }}
            mainClassName={styles["page-numbers"]}
            buttonClassName={styles["page-button"]}
            activeButtonClassName={`${styles["page-button"]} ${styles["current"]}`}
          />
        </div>
      )}
    </div>
  );
}

//small client-side filter function since we're currently getting all design data at once
function filterDesigns(
  designResults: DesignResultsSerializable,
  subcategoryId: number | null,
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
      const searchCondition = search
        ? !!searchable.find((str) =>
            str.toLocaleLowerCase().startsWith(search.toLocaleLowerCase())
          )
        : true;
      const subcategoryCondition =
        !subcategoryId ||
        design.designSubcategories.find((sub) => sub.id === subcategoryId);
      return searchCondition && subcategoryCondition;
    });

  return filtered;
}
