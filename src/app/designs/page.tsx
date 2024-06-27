import { PageControls } from "@/components/PageControls";
import { defaultPerPage, pageSizeChoices } from "@/constants";
import { getDesignCategoryHierarchy, getDesigns } from "@/db/access/designs";
import Link from "next/link";
import styles from "../../styles/designs.module.css";
import { DesignQuery } from "@/types/types";
import Search from "./Search";
import ResultsTable from "./ResultsTable";
import Filter from "./Filter";
import { SortingDirection, SortingType } from "@/types/schema";

type Props = {
  searchParams?: any;
};
export default async function Designs({ searchParams }: Props) {
  const {
    pageNumber,
    perPage,
    designType,
    keyword,
    subcategory,
    status,
    featuredOnly,
    before,
    after,
    sortBy,
  } = parseSearchParams(searchParams);
  const { designs, totalResults } = await getDesigns({
    pageNumber,
    perPage,
    designType,
    keyword,
    subcategory,
    status,
    featuredOnly,
    before,
    after,
    sortBy,
  });
  const categories = await getDesignCategoryHierarchy();

  return (
    <>
      <Link href="designs/0" className="link-as-button">
        + Create Design
      </Link>
      <Link
        href={`designs/?designType=${encodeURIComponent("Screen Print")}`}
        className={`link-as-button ${
          designType === "Screen Print" ? "current" : ""
        }`}
      >
        Screen Print
      </Link>
      <Link
        href="designs/?designType=Embroidery"
        className={`link-as-button ${
          designType === "Embroidery" ? "current" : ""
        }`}
      >
        Embroidery
      </Link>
      <Search />
      <Filter categories={categories} />
      <ResultsTable designs={designs} />
      {designs.length === 0 && <h2>No results</h2>}

      <PageControls
        curItemsPerPage={perPage}
        curPageNumber={designs.length === 0 ? 1 : pageNumber}
        pageSizeChoices={pageSizeChoices}
        totalPages={designs.length === 0 ? 1 : totalResults / perPage}
        buttonClassName="link-as-button"
        activeButtonClassName="current"
      />
    </>
  );
}

function parseSearchParams(searchParams: any): Omit<
  DesignQuery,
  "pageNumber" | "perPage"
> & {
  pageNumber: number;
  perPage: number;
} {
  if (!searchParams)
    return {
      pageNumber: 1,
      perPage: defaultPerPage,
    };

  const pageNumber =
    searchParams.pageNumber && !isNaN(+searchParams.pageNumber)
      ? +searchParams.pageNumber
      : 1;
  const perPage =
    searchParams.perPage && !isNaN(+searchParams.perPage)
      ? +searchParams.perPage
      : defaultPerPage;
  const designType =
    searchParams.designType === "Embroidery" ? "Embroidery" : "Screen Print";
  const keyword = searchParams.keywords;
  const subcategory = searchParams.subcategory;
  const status = searchParams.status;
  const featuredOnly = searchParams.featuredOnly === "true" ? true : undefined;
  const before = searchParams.before ? +searchParams.before : undefined;
  const after = searchParams.after ? +searchParams.after : undefined;
  const sortBy = decodeURIComponent(searchParams.sortBy) as SortingType;
  const sortDirection = decodeURIComponent(
    searchParams.sortDirection
  ) as SortingDirection;

  return {
    pageNumber,
    perPage,
    designType,
    keyword,
    subcategory,
    status,
    featuredOnly,
    before,
    after,
    sortBy: {
      type: sortBy,
      direction: sortDirection,
    },
  };
}
