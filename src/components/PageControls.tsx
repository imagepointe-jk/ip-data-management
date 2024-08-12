"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "../styles/PageControls.module.css";
import Link from "next/link";

type ButtonOverrides = {
  onClickPageNumber?: (clickedNumber: number) => void;
  onClickPageSize?: (clickedNumber: number) => void;
};
type PageControlsProps = {
  totalPages: number;
  curPageNumber: number;
  curItemsPerPage: number;
  pageSizeChoices?: number[];
  showJumpTo?: boolean;
  buttonOverrides?: ButtonOverrides; //if function overrides are provided, the page number/page size buttons will be actual buttons using given functions, instead of <a>
  buttonClassName?: string;
  activeButtonClassName?: string;
  mainClassName?: string;
};

export function PageControls({
  curItemsPerPage,
  curPageNumber,
  pageSizeChoices,
  totalPages,
  showJumpTo,
  buttonOverrides,
  activeButtonClassName,
  buttonClassName,
  mainClassName,
}: PageControlsProps) {
  return (
    <div className={mainClassName || styles["main"]}>
      <PageNumberControl
        curPageNumber={curPageNumber}
        totalPages={totalPages}
        buttonClassName={buttonClassName}
        activeButtonClassName={activeButtonClassName}
        buttonOverrides={buttonOverrides}
      />
      {showJumpTo && (
        <JumpToControl curPageNumber={curPageNumber} totalPages={totalPages} />
      )}
      {pageSizeChoices && (
        <PageSizeControl
          curItemsPerPage={curItemsPerPage}
          pageSizeChoices={pageSizeChoices}
          buttonOverrides={buttonOverrides}
          buttonClassName={buttonClassName}
          activeButtonClassName={activeButtonClassName}
        />
      )}
    </div>
  );
}

type PageNumberControlProps = {
  totalPages: number;
  curPageNumber: number;
  buttonOverrides?: ButtonOverrides;
  buttonClassName?: string;
  activeButtonClassName?: string;
};

function PageNumberControl({
  curPageNumber,
  totalPages,
  buttonOverrides,
  activeButtonClassName,
  buttonClassName,
}: PageNumberControlProps) {
  const pageControlNumbers = addEllipsisToNumberArray(
    getPageControlNumbers(totalPages, curPageNumber)
  );
  const searchParams = useSearchParams();
  const pathName = usePathname();

  return (
    <div className={styles["controls-subsection"]}>
      <span className={styles["page-buttons-label"]}>Page</span>
      {pageControlNumbers.map((numberOrEllipsis, i) => {
        if (numberOrEllipsis === "...") return <div key="ellipsis">...</div>;
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("pageNumber", `${numberOrEllipsis}`);
        const onClickPageNumber = buttonOverrides?.onClickPageNumber;
        const className = `${buttonClassName || ""} ${
          curPageNumber === numberOrEllipsis ? activeButtonClassName : ""
        }`;

        return (
          <>
            {!onClickPageNumber && (
              <Link
                key={`${numberOrEllipsis}-${i}`}
                className={className}
                style={{
                  pointerEvents:
                    curPageNumber === numberOrEllipsis ? "none" : "initial",
                }}
                href={`${pathName}?${newParams}`}
              >
                {numberOrEllipsis}
              </Link>
            )}
            {onClickPageNumber && (
              <button
                key={`${numberOrEllipsis}-${i}`}
                className={className}
                style={{
                  pointerEvents:
                    curPageNumber === numberOrEllipsis ? "none" : "initial",
                }}
                onClick={() => onClickPageNumber(numberOrEllipsis)}
              >
                {numberOrEllipsis}
              </button>
            )}
          </>
        );
      })}
    </div>
  );
}

type JumpToControlProps = {
  totalPages: number;
  curPageNumber: number;
};

function JumpToControl({ curPageNumber, totalPages }: JumpToControlProps) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  function submitJumpToPage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const jumpToPage = formData.get("jump-to-page");
    const roundedPages = Math.ceil(totalPages);
    if (
      !jumpToPage ||
      isNaN(+jumpToPage) ||
      +jumpToPage < 1 ||
      +jumpToPage > roundedPages ||
      +jumpToPage === curPageNumber
    )
      return;

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("pageNumber", `${+jumpToPage}`);
    router.push(`${pathName}?${newSearchParams}`);
  }

  return (
    <div className={styles["controls-subsection"]}>
      <div>Jump To</div>
      <form
        className={styles["controls-subsection"]}
        onSubmit={submitJumpToPage}
      >
        <input
          className={styles["jump-to-page-input"]}
          type="number"
          name="jump-to-page"
          id="jump-to-page"
        />
        <button type="submit">Go</button>
      </form>
    </div>
  );
}

type PageSizeControlProps = {
  curItemsPerPage: number;
  pageSizeChoices: number[];
  buttonClassName?: string;
  activeButtonClassName?: string;
  buttonOverrides?: ButtonOverrides;
};

function PageSizeControl({
  curItemsPerPage,
  pageSizeChoices,
  buttonOverrides,
  activeButtonClassName,
  buttonClassName,
}: PageSizeControlProps) {
  const searchParams = useSearchParams();
  const pathName = usePathname();

  return (
    <div className={styles["controls-subsection"]}>
      <div>Results Per Page</div>
      {pageSizeChoices.map((choice, i) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("perPage", `${choice}`);
        newParams.set("pageNumber", "1");
        const onClickPageSize = buttonOverrides?.onClickPageSize;
        const className = `${buttonClassName} ${
          (i === 0 && !curItemsPerPage) || curItemsPerPage === choice
            ? activeButtonClassName
            : ""
        }`;

        return (
          <>
            {!onClickPageSize && (
              <Link
                key={i}
                className={className}
                style={{
                  pointerEvents:
                    (i === 0 && !curItemsPerPage) || curItemsPerPage === choice
                      ? "none"
                      : "initial",
                }}
                href={`${pathName}?${newParams}`}
              >
                {choice}
              </Link>
            )}
            {onClickPageSize && (
              <button
                key={i}
                className={className}
                style={{
                  pointerEvents:
                    (i === 0 && !curItemsPerPage) || curItemsPerPage === choice
                      ? "none"
                      : "initial",
                }}
                onClick={() => onClickPageSize(choice)}
              >
                {choice}
              </button>
            )}
          </>
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
