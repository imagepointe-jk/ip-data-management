import {
  getWebstores,
  getWorkflowsWithIncludes,
} from "@/db/access/orderApproval";
import GenericTable from "@/components/GenericTable";
import { ResultsTable } from "./ResultsTable";
import { CreateWorkflow } from "./CreateWorkflow";
import { DuplicateWorkflow } from "./DuplicateWorkflow";

export default async function OrderApproval() {
  const workflows = await getWorkflowsWithIncludes();
  const sortedWorkflows = [...workflows];
  sortedWorkflows.sort((a, b) => a.id - b.id);
  const webstores = await getWebstores();
  const sortedWebstores = [...webstores];
  sortedWebstores.sort((a, b) => a.id - b.id);

  const webstoresWithWorkflowBool = webstores.map((webstore) => ({
    data: webstore,
    hasWorkflow: !!sortedWorkflows.find(
      (workflow) => workflow.webstoreId === webstore.id
    ),
  }));

  return (
    <>
      <h1>Workflows</h1>
      <p>
        A workflow is a series of steps that will be executed after an order is
        placed.
      </p>
      <ResultsTable workflows={sortedWorkflows} />
      <div
        className="content-frame"
        style={{ width: "400px", marginTop: "20px" }}
      >
        <CreateWorkflow webstores={webstoresWithWorkflowBool} />
      </div>
      <div
        className="content-frame"
        style={{ width: "400px", marginTop: "20px" }}
      >
        <DuplicateWorkflow
          workflows={workflows.map((item) => ({
            id: item.id,
            name: item.name,
          }))}
          webstores={webstoresWithWorkflowBool}
        />
      </div>
    </>
  );
}
