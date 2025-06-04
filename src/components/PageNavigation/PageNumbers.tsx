import Link from "next/link";
import styles from "@/styles/PageNavigation/pageNavigation.module.css";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  totalPages: number;
  pageParamNameOverride?: string; //if the page param in searchParams should be named something other than "page"
};
export function PageNumbers({ totalPages, pageParamNameOverride }: Props) {
  const pathname = usePathname();
  const search = useSearchParams();
  const pageNumberParam = search.get(pageParamNameOverride || "page");
  const currentPage = isNaN(+`${pageNumberParam}`) ? 1 : +`${pageNumberParam}`;

  const pageControlNumbers = addEllipsisToNumberArray(
    getPageControlNumbers(totalPages, currentPage)
  );

  function getClassName(item: number | "...") {
    if (item === "...") return undefined;

    if (item === currentPage) return "link-as-button current";
    return "link-as-button";
  }

  function createHref(page: number) {
    const newParams = new URLSearchParams(search);
    newParams.set(pageParamNameOverride || "page", `${page}`);

    return `${pathname}?${newParams}`;
  }

  return (
    <div className={styles["page-numbers-container"]}>
      {pageControlNumbers.map((item, i) => {
        if (item === "...") return <div key={`${i}-...`}>...</div>;
        return (
          <Link
            key={`${item}-${i}`}
            href={createHref(item)}
            className={getClassName(item)}
          >
            {item}
          </Link>
        );
      })}
    </div>
  );
}

function getPageControlNumbers(
  totalPages: number,
  currentPage: number
): number[] {
  const roundedPages = Math.ceil(totalPages);
  if (currentPage < 1 || currentPage > roundedPages) {
    console.error("The current page must be between 1 and totalPages.");
    return [];
  }

  const pageNumbers = Array.from(
    { length: roundedPages },
    (_, i) => i + 1
  ).filter((thisPage, i, arr) => {
    function distanceCondition(thisPage: number) {
      const distanceToStart = thisPage - 1;
      const distanceToEnd = roundedPages - thisPage;
      const distanceToCurrentPage = Math.abs(currentPage - thisPage);
      const currentPageIsLimit =
        currentPage === 1 || currentPage === roundedPages;
      return (
        distanceToStart === 0 ||
        distanceToEnd === 0 ||
        (currentPageIsLimit && distanceToCurrentPage < 3) ||
        (!currentPageIsLimit && distanceToCurrentPage < 2)
      );
    }
    const distanceConditionHere = distanceCondition(thisPage);
    const distanceConditionPrev = i > 1 ? distanceCondition(arr[i - 1]!) : true;
    const distanceConditionNext =
      i < roundedPages ? distanceCondition(arr[i + 1]!) : true;

    return (
      distanceConditionHere || (distanceConditionPrev && distanceConditionNext)
    );
  });

  return pageNumbers;
}

function addEllipsisToNumberArray(array: number[]): (number | "...")[] {
  const newArr: (number | "...")[] = [];
  for (let i = 0; i < array.length; i++) {
    newArr.push(array[i]!);
    const deltaToNext = array[i + 1]! - array[i]!;
    if (deltaToNext > 1) newArr.push("...");
  }
  return newArr;
}
