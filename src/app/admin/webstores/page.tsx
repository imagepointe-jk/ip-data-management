import { CreateButton } from "./CreateButton";
import { ResultsExplorer } from "./ResultsExplorer";
import { prisma } from "@/prisma";

export default async function Page() {
  const [webstoreResults, allWebstores] = await prisma.$transaction([
    prisma.webstore.findMany({
      orderBy: {
        id: "asc",
      },
    }),
    prisma.webstore.findMany(),
  ]);

  return (
    <>
      <h1>Webstores</h1>
      <p>
        These records establish a link between an external webstore and the IP
        DataManagement system.
      </p>
      <ResultsExplorer
        webstores={webstoreResults}
        pageSize={20}
        totalRecords={allWebstores.length}
      />
      <CreateButton />
    </>
  );
}
