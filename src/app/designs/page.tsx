import { PageControls } from "@/components/PageControls";
import { defaultPerPage, pageSizeChoices } from "@/constants";
import { getDesigns } from "@/db/access/designs";
import Link from "next/link";
import styles from "../../styles/designs.module.css";

type Props = {
  searchParams?: any;
};
export default async function Designs({ searchParams }: Props) {
  const { pageNumber, perPage, designType } = parseSearchParams(searchParams);
  const { designs, totalResults } = await getDesigns({
    pageNumber,
    perPage,
    designType,
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
      <PageControls
        curItemsPerPage={perPage}
        curPageNumber={pageNumber}
        pageSizeChoices={pageSizeChoices}
        totalPages={totalResults / perPage}
        buttonClassName="link-as-button"
        activeButtonClassName="current"
      />
    </>
  );
}

function parseSearchParams(searchParams: any) {
  const pageNumber =
    searchParams && searchParams.pageNumber && !isNaN(+searchParams.pageNumber)
      ? +searchParams.pageNumber
      : 1;
  const perPage =
    searchParams && searchParams.perPage && !isNaN(+searchParams.perPage)
      ? +searchParams.perPage
      : defaultPerPage;
  const designType =
    searchParams && searchParams.designType === "Embroidery"
      ? "Embroidery"
      : "Screen Print";

  return {
    pageNumber,
    perPage,
    designType,
  };
}
