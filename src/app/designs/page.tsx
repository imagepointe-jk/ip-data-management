import { PageControls } from "@/components/PageControls";
import { defaultPerPage, pageSizeChoices } from "@/constants";
import { getDesigns } from "@/db/access/designs";
import Link from "next/link";
import styles from "../../styles/designs.module.css";
import { DesignQuery } from "@/types/types";
import Search from "./Search";

type Props = {
  searchParams?: any;
};
export default async function Designs({ searchParams }: Props) {
  const { pageNumber, perPage, designType, keyword } =
    parseSearchParams(searchParams);
  const { designs, totalResults } = await getDesigns({
    pageNumber,
    perPage,
    designType,
    keyword,
  });

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
      <table className={styles["design-table"]}>
        <thead>
          <tr>
            <th className={styles["img-column"]}>
              <div>Image</div>
            </th>
            <th className={styles["main-column"]}>
              <div>Design Number</div>
            </th>
            <th>
              <div>Data 3</div>
            </th>
            <th>
              <div>Data 4</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {designs.map((design) => (
            <tr key={design.id}>
              <td>
                <div style={{ height: "50px", width: "50px" }}>
                  <img
                    style={{
                      height: "100%",
                      backgroundColor: `#${design.defaultBackgroundColor.hexCode}`,
                    }}
                    src={design.imageUrl}
                    alt="Design Image"
                  />
                </div>
              </td>
              <td>
                <Link href={`designs/${design.id}`}>
                  #{design.designNumber}
                </Link>
              </td>
              <td>Data 3</td>
              <td>Data 4</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalResults === 0 && <h2>No results</h2>}
      {totalResults > 0 && (
        <PageControls
          curItemsPerPage={perPage}
          curPageNumber={pageNumber}
          pageSizeChoices={pageSizeChoices}
          totalPages={totalResults / perPage}
          buttonClassName="link-as-button"
          activeButtonClassName="current"
        />
      )}
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

  return {
    pageNumber,
    perPage,
    designType,
    keyword,
  };
}
