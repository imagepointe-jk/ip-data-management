import { setWorkflowInstanceStatus } from "@/db/access/orderApproval";
import { OrderWorkflowInstance } from "@prisma/client";
import { createWorkflowInstanceLog } from "../utility";

export async function doWorkflowDeniedAction(
  workflowInstance: OrderWorkflowInstance
) {
  await setWorkflowInstanceStatus(workflowInstance.id, "finished");
  await createWorkflowInstanceLog(
    workflowInstance.id,
    `Workflow instance ${workflowInstance.id} successfully denied.`,
    "info",
    "deny workflow instance"
  );
}
