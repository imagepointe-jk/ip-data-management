import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { OrderWorkflowInstance } from "@prisma/client";
import { decryptWebstoreData } from "../encryption";
import { setOrderStatus } from "@/fetch/woocommerce";
import { createLog } from "@/actions/orderWorkflow/create";
import { createWorkflowInstanceLog } from "../utility/server";

export async function doCancelOrderAction(
  workflowInstance: OrderWorkflowInstance
) {
  try {
    const workflow = await getWorkflowWithIncludes(
      workflowInstance.parentWorkflowId
    );
    if (!workflow)
      throw new Error(
        "Canceling FAILED because the workflow could not be found"
      );
    const { key, secret } = decryptWebstoreData(workflow.webstore);
    const cancelResponse = await setOrderStatus(
      workflowInstance.wooCommerceOrderId,
      workflow.webstore.url,
      key,
      secret,
      "cancelled"
    );
    if (!cancelResponse.ok)
      throw new Error(
        `Canceling FAILED because of an API error ${cancelResponse.status}`
      );
    await createLog(
      workflow.webstoreId,
      `WooCommerce order for workflow instance ${workflowInstance.id} successfully cancelled.`,
      "info",
      "deny workflow instance"
    );
  } catch (error) {
    console.error(error);
    await createWorkflowInstanceLog(
      workflowInstance.id,
      `WooCommerce order for workflow instance ${workflowInstance.id} could not be cancelled.`,
      "error",
      "deny workflow instance"
    );
  }
}
