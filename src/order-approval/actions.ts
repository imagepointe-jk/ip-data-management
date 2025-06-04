import { OrderWorkflowActionType } from "@/types/schema/orderApproval";
import { OrderWorkflowInstance, OrderWorkflowStep } from "@prisma/client";
import { createShippingEmail, processFormattedText } from "./mail/mail";
import {
  getWorkflowWithIncludes,
  setWorkflowInstanceStatus,
} from "@/db/access/orderApproval";
import { getEnvVariable } from "@/utility/misc";
import { sendEmail } from "@/utility/mail";
import { decryptWebstoreData } from "./encryption";
import { setOrderStatus } from "@/fetch/woocommerce";
import { env } from "@/env";
import {
  createWorkflowInstanceLog,
  resolveDynamicUserIdentifier,
} from "./utility";
import { createLog } from "@/actions/orderWorkflow/create";

export async function doStepAction(
  step: OrderWorkflowStep,
  workflowInstance: OrderWorkflowInstance
) {
  const { actionType: a } = step;
  const actionType = a as OrderWorkflowActionType;
  if (actionType === "email") {
    await doEmailAction(step, workflowInstance);
  } else if (actionType === "mark workflow approved") {
    await doWorkflowApprovedAction(workflowInstance);
  } else if (actionType === "mark workflow denied") {
    await doWorkflowDeniedAction(workflowInstance);
  } else if (actionType === "cancel woocommerce order") {
    await doCancelOrderAction(workflowInstance);
  } else {
    throw new Error(
      `Unrecognized action type "${actionType}" of step ${step.id} in workflow instance ${workflowInstance.id}`
    );
  }
}

async function doEmailAction(
  step: OrderWorkflowStep,
  workflowInstance: OrderWorkflowInstance
) {
  const { actionMessage, actionTarget, actionSubject } = step;
  const targetPrimary = await resolveDynamicUserIdentifier(
    actionTarget,
    workflowInstance
  );
  if (!targetPrimary)
    throw new Error(
      `Workflow instance ${workflowInstance.id} tried to send an email to invalid target "${actionTarget}"!`
    );
  const otherTargets = step.otherActionTargets
    ? step.otherActionTargets.split(";")
    : [];
  const processedSubject = (actionSubject || "Order Update").replace(
    /\{order-id\}/,
    `${workflowInstance.wooCommerceOrderId}`
  ); //currently the order id is the only dynamic value needed for the subject; this will need to be more robust if more are needed
  const processedMessage = await processFormattedText(
    `${actionMessage}`,
    workflowInstance.id,
    targetPrimary
  );
  const allTargets = [targetPrimary, ...otherTargets];

  for (const target of allTargets) {
    //The message may appear to be addressed directly to targetPrimary.
    //Clarify to anyone in allTargets that they are intentionally receiving the message as well.
    const prepend =
      target === targetPrimary
        ? ""
        : `<strong>This message's primary recipient is ${targetPrimary}, but you have have been included on the email list for this order.</strong><br /><br />`;

    try {
      await sendEmail(target, processedSubject, prepend + processedMessage);
      await createWorkflowInstanceLog(
        workflowInstance.id,
        `Step ${step.order} of workflow instance ${workflowInstance.id} sent an email to ${target}`,
        "info",
        "send email"
      );
    } catch (error) {
      await createWorkflowInstanceLog(
        workflowInstance.id,
        `Step ${step.order} of workflow instance ${workflowInstance.id} failed to send an email to ${target}`,
        "error",
        "send email"
      );
    }
  }
}

async function doWorkflowApprovedAction(
  workflowInstance: OrderWorkflowInstance
) {
  console.log(
    `=====================Marking workflow instance ${workflowInstance.id} as "APPROVED"`
  );
  await setWorkflowInstanceStatus(workflowInstance.id, "finished");

  const parentWorkflow = await getWorkflowWithIncludes(
    workflowInstance.parentWorkflowId
  );
  if (!parentWorkflow) throw new Error("No parent workflow");
  const shippingEmail =
    parentWorkflow.webstore.shippingEmailDestOverride ||
    getEnvVariable("IP_SHIPPING_EMAIL");
  const shippingMessage = await createShippingEmail(workflowInstance.id);

  await sendEmail(
    shippingEmail,
    `Order ${workflowInstance.wooCommerceOrderId} Approved`,
    shippingMessage
  );

  try {
    const { key, secret } = decryptWebstoreData(parentWorkflow.webstore);
    const response = await setOrderStatus(
      workflowInstance.wooCommerceOrderId,
      parentWorkflow.webstore.url,
      key,
      secret,
      "processing"
    );
    if (!response.ok)
      throw new Error(`The API responded with a ${response.status} status.`);
    await createLog(
      parentWorkflow.webstoreId,
      `Workflow instance ${workflowInstance.id} successfully approved.`,
      "info",
      "approve workflow instance"
    );
  } catch (error) {
    createLog(
      parentWorkflow.webstoreId,
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

async function doWorkflowDeniedAction(workflowInstance: OrderWorkflowInstance) {
  await setWorkflowInstanceStatus(workflowInstance.id, "finished");
  await createWorkflowInstanceLog(
    workflowInstance.id,
    `Workflow instance ${workflowInstance.id} successfully denied.`,
    "info",
    "deny workflow instance"
  );
}

async function doCancelOrderAction(workflowInstance: OrderWorkflowInstance) {
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
