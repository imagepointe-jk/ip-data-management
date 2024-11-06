import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";
import { CreateUser } from "./CreateUser";
import Link from "next/link";

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
      <Link href={`../${id}`}>&lt; Back to {webstore.name}</Link>
      {webstore.users.length > 0 && <ResultsTable webstore={webstore} />}
      {webstore.users.length === 0 && <p>No users.</p>}
      <CreateUser webstoreId={webstore.id} />
    </>
  );
}
