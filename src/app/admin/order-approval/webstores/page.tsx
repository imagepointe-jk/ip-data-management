import { getWebstoresWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";

export default async function Page() {
  const webstores = await getWebstoresWithIncludes();

  return (
    <>
      <h1>Webstores</h1>
      <p>
        These records establish a link between an external webstore and the
        order approval system.
      </p>
      <ResultsTable webstores={webstores} />
    </>
  );
}
