import {
  getWebstores,
  getWorkflowsWithIncludes,
} from "@/db/access/orderApproval";
import GenericTable from "@/components/GenericTable";
import { ResultsTable } from "./ResultsTable";
import { CreateWorkflow } from "./CreateWorkflow";

export default async function OrderApproval() {
  const workflows = await getWorkflowsWithIncludes();
  const webstores = await getWebstores();

  return (
    <>
      <h1>Workflows</h1>
      <p>
        A workflow is a series of steps that will be executed after an order is
        placed.
      </p>
      <ResultsTable workflows={workflows} />
      <div
        className="content-frame"
        style={{ width: "400px", marginTop: "20px" }}
      >
        <CreateWorkflow webstores={webstores} />
      </div>
    </>
  );
}
