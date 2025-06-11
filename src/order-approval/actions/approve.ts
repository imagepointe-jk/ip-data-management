import {
  getWorkflowWithIncludes,
  setWorkflowInstanceStatus,
} from "@/db/access/orderApproval";
import { env } from "@/env";
import { createShippingEmail } from "../mail/mail";
import { sendEmail } from "@/utility/mail";
import { decryptWebstoreData } from "../encryption";
import { setOrderStatus } from "@/fetch/woocommerce";
import { OrderWorkflowInstance, Webstore } from "@prisma/client";
import { createLog } from "@/actions/orderWorkflow/create";

export async function doWorkflowApprovedAction(
  workflowInstance: OrderWorkflowInstance
) {
  const parentWorkflow = await getWorkflowWithIncludes(
    workflowInstance.parentWorkflowId
  );
  if (!parentWorkflow) throw new Error("No parent workflow");

  await setWorkflowInstanceStatus(workflowInstance.id, "finished");
  await setOrderProcessing(parentWorkflow.webstore, workflowInstance);

  await sendShippingEmail(
    parentWorkflow.webstore.shippingEmailDestOverride,
    workflowInstance
  );
}

async function setOrderProcessing(
  webstore: Webstore,
  workflowInstance: OrderWorkflowInstance
) {
  try {
    const { key, secret } = decryptWebstoreData(webstore);
    const response = await setOrderStatus(
      workflowInstance.wooCommerceOrderId,
      webstore.url,
      key,
      secret,
      "processing"
    );
    if (!response.ok)
      throw new Error(`The API responded with a ${response.status} status.`);
    await createLog(
      webstore.id,
      `Workflow instance ${workflowInstance.id} successfully approved.`,
      "info",
      "approve workflow instance"
    );
  } catch (error) {
    createLog(
      webstore.id,
      `Error while approving workflow instance ${workflowInstance.id}. The instance was marked as finished, but the WooCommerce order's status could not be set to "PROCESSING".`,
      "error",
      "approve workflow instance"
    );
    sendEmail(
      env.DEVELOPER_EMAIL,
      `Error approving workflow instance ${workflowInstance.id}`,
      `Failed to set the corresponding WooCommerce order's status to "PROCESSING". This was the error: ${error}`
    );
  }
}

async function sendShippingEmail(
  recipientOverride: string | null,
  workflowInstance: OrderWorkflowInstance
) {
  const shippingEmail = recipientOverride || env.IP_SHIPPING_EMAIL;
  const shippingMessage = await createShippingEmail(workflowInstance.id);

  await sendEmail(
    shippingEmail,
    `Order ${workflowInstance.wooCommerceOrderId} Approved`,
    shippingMessage
  );
}
