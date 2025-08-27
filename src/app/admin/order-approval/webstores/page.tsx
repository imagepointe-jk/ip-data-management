import { getWebstoresWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";
import { CreateButton } from "./CreateButton";

export default async function Page() {
  const webstores = await getWebstoresWithIncludes();
  const sortedWebstores = [...webstores];
  sortedWebstores.sort((a, b) => a.id - b.id);

  return (
    <>
      <h1>Webstores</h1>
      <p>
        These records establish a link between an external webstore and the
        order approval system.
      </p>
      <ResultsTable webstores={sortedWebstores} />
      <CreateButton />
    </>
  );
}
