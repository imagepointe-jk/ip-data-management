import { getQuoteRequests } from "@/db/access/customizer";
import ResultsTable from "./ResultsTable";
import { PageControls } from "@/components/PageControls";

const defaultPerPage = 25;
type Props = {
  searchParams?: any;
};
export default async function Page({ searchParams }: Props) {
  const { pageNumber } = parseSearchParams(searchParams);
  const requests = await getQuoteRequests({
    page: pageNumber,
    perPage: defaultPerPage,
  });

  return (
    <>
      <h1>Lead Inbox</h1>
      <ResultsTable requests={requests.results} />
      <PageControls
        curItemsPerPage={defaultPerPage}
        curPageNumber={pageNumber}
        totalPages={Math.ceil(requests.totalResults / defaultPerPage)}
        showJumpTo={false}
        pageSizeChoices={[defaultPerPage]}
        buttonClassName="link-as-button"
        activeButtonClassName="current"
      />
    </>
  );
}

function parseSearchParams(params: any) {
  if (!params)
    return {
      pageNumber: 1,
    };

  const pageNumber = !isNaN(+`${params.pageNumber}`)
    ? +`${params.pageNumber}`
    : 1;

  return { pageNumber };
}
