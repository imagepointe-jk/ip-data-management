import { getWorkflowsWithIncludes } from "@/db/access/orderApproval";
import GenericTable from "@/components/GenericTable";
import { ResultsTable } from "./ResultsTable";

export default async function OrderApproval() {
  const workflows = await getWorkflowsWithIncludes();

  return (
    <>
      <h1>Workflows</h1>
      <p>
        A workflow is a series of steps that will be executed after an order is
        placed.
      </p>
      <ResultsTable workflows={workflows} />
    </>
  );
}
