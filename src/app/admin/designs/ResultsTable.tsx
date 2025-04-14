"use client";

import GenericTable from "@/components/GenericTable";
import Link from "next/link";
import styles from "@/styles/designs/designs.module.css";
import SortIcon from "@/components/SortIcon";
import { useRouter, useSearchParams } from "next/navigation";
import { DesignWithIncludes } from "@/types/schema/designs";
import { AsyncCheckbox } from "@/components/AsyncCheckbox";
import { updateDesign } from "@/actions/designs/update";

type Props = {
  designs: DesignWithIncludes[];
};
export default function ResultsTable({ designs }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortByInParams = decodeURIComponent(`${searchParams.get("sortBy")}`);
  const sortDirectionInParams = decodeURIComponent(
    `${searchParams.get("sortDirection")}`
  );
  const designNumberSorting = sortByInParams === "Design Number";
  const designDateSorting = sortByInParams === "Date";
  const prioritySorting = sortByInParams === "Priority";
  const sortDirection = sortDirectionInParams === "Ascending" ? "asc" : "desc";
  const designNumberSortIcon =
    designNumberSorting && sortDirection === "asc"
      ? "up"
      : designNumberSorting && sortDirection === "desc"
      ? "down"
      : "both";
  const designDateSortIcon =
    designDateSorting && sortDirection === "asc"
      ? "up"
      : designDateSorting && sortDirection === "desc"
      ? "down"
      : "both";
  const designPrioritySortIcon =
    prioritySorting && sortDirection === "asc"
      ? "up"
      : prioritySorting && sortDirection === "desc"
      ? "down"
      : "both";

  function createUnsortedSearchParams() {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("sortBy");
    newSearchParams.delete("sortDirection");
    return newSearchParams;
  }

  function setSortDirectionConditionally(
    searchParams: URLSearchParams,
    condition: boolean
  ) {
    if (condition) {
      if (sortDirection === "asc")
        searchParams.set("sortDirection", "Descending");
      else searchParams.set("sortDirection", "Ascending");
    } else {
      searchParams.set("sortDirection", "Descending");
    }
  }

  function onClickDesignNumberHeader() {
    const newSearchParams = createUnsortedSearchParams();
    newSearchParams.set("sortBy", "Design Number");
    setSortDirectionConditionally(newSearchParams, designNumberSorting);

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  function onClickDesignDateHeader() {
    const newSearchParams = createUnsortedSearchParams();
    newSearchParams.set("sortBy", "Date");
    setSortDirectionConditionally(newSearchParams, designDateSorting);

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  function onClickPriorityHeader() {
    const newSearchParams = createUnsortedSearchParams();
    newSearchParams.set("sortBy", "Priority");
    setSortDirectionConditionally(newSearchParams, prioritySorting);

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  return (
    <GenericTable
      className={styles["design-table"]}
      dataset={designs}
      columns={[
        {
          headerName: "Image",
          className: styles["img-column"],
          createCell: (data) => (
            <div style={{ height: "50px", width: "50px" }}>
              <img
                style={{
                  height: "100%",
                  backgroundColor: `#${data.defaultBackgroundColor.hexCode}`,
                }}
                src={data.imageUrl}
              />
            </div>
          ),
        },
        {
          headerName: "Design Number",
          createHeader: () => (
            <div className="clickable" onClick={onClickDesignNumberHeader}>
              <div>Design Number</div>
              <SortIcon state={designNumberSortIcon} />
            </div>
          ),
          className: styles["main-column"],
          createCell: (design) => (
            <Link href={`designs/${design.id}`}>{design.designNumber}</Link>
          ),
        },
        {
          headerName: "Published",
          createCell: (design) => (
            <AsyncCheckbox
              initialChecked={design.status === "Published"}
              onChange={(checked) =>
                updateDesign({
                  id: design.id,
                  status: checked ? "Published" : "Draft",
                })
              }
            />
          ),
        },
        {
          headerName: "Featured",
          createCell: (design) => (
            <AsyncCheckbox
              initialChecked={design.featured}
              onChange={(checked) =>
                updateDesign({ id: design.id, featured: checked })
              }
            />
          ),
        },
        {
          headerName: "Design Date",
          createHeader: () => (
            <div className="clickable" onClick={onClickDesignDateHeader}>
              <div>Design Date</div>
              <SortIcon state={designDateSortIcon} />
            </div>
          ),
          createCell: (design) => design.date.toLocaleDateString(),
        },
        {
          headerName: "Priority",
          createHeader: () => (
            <div className="clickable" onClick={onClickPriorityHeader}>
              <div>Priority</div>
              <SortIcon state={designPrioritySortIcon} />
            </div>
          ),
          createCell: (design) => design.priority,
        },
      ]}
    />
  );
}
