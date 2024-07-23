import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params: { id } }: Props) {
  const webstore = await getWebstoreWithIncludes(+id);
  if (!webstore) return <h1>Webstore {id} not found.</h1>;

  return (
    <>
      <h1>{webstore.name} Users</h1>
      <ResultsTable webstore={webstore} />
    </>
  );
}
