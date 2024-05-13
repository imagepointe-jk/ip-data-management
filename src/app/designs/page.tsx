import { PageControls } from "@/components/PageControls";
import { defaultPerPage, pageSizeChoices } from "@/constants";
import { getDesigns } from "@/db/access/designs";

type Props = {
  searchParams?: {
    perPage?: string;
    pageNumber?: string;
  };
};
export default async function Designs({ searchParams }: Props) {
  const pageNumber =
    searchParams && searchParams.pageNumber && !isNaN(+searchParams.pageNumber)
      ? +searchParams.pageNumber
      : 1;
  const perPage =
    searchParams && searchParams.perPage && !isNaN(+searchParams.perPage)
      ? +searchParams.perPage
      : defaultPerPage;
  const { designs, totalResults } = await getDesigns({ pageNumber, perPage });

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Design Number</th>
            <th>Data 3</th>
            <th>Data 4</th>
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
                    src={design.image ? design.image.url : ""}
                    alt="Design Image"
                  />
                </div>
              </td>
              <td>#{design.designNumber}</td>
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
      />
    </>
  );
}
