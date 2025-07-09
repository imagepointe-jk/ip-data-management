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
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import { useDispatch } from "react-redux";

const pageSize = 20;

export function DesignPicker() {
  const designResults = useDesignDataSelector();
  const { designBrowserData } = useEditorSelectors();
  const dispatch = useDispatch();

  const filtered = filterDesigns(designResults, designBrowserData.search);
  const resultsPage = getArrayPage(filtered, designBrowserData.page, pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div>
      <div>
        <input
          className={styles["search"]}
          type="text"
          placeholder="Search designs..."
          onChange={(e) => dispatch(setDesignBrowserSearch(e.target.value))}
          value={designBrowserData.search}
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
