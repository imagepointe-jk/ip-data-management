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
  const targetPrimary =
    actionTarget === "purchaser"
      ? workflowInstance.purchaserEmail
      : actionTarget;
  if (!targetPrimary)
    throw new Error(
      `Workflow instance ${workflowInstance.id} tried to send an email to an invalid target!`
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

  console.log(
    `=====================Workflow Instance ${workflowInstance.id} sending email(s) to ${actionTarget} (${targetPrimary}) and ${otherTargets.length} other targets`
  );
  for (const target of allTargets) {
    //The message may appear to be addressed directly to targetPrimary.
    //Clarify to anyone in allTargets that they are intentionally receiving the message as well.
    const prepend =
      target === targetPrimary
        ? ""
        : `<strong>This message's primary recipient is ${targetPrimary}, but you have have been included on the email list for this order.</strong><br /><br />`;

    await sendEmail(target, processedSubject, prepend + processedMessage);
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
  const shippingEmail = getEnvVariable("IP_SHIPPING_EMAIL");
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
  } catch (error) {
    sendEmail(
      env.DEVELOPER_EMAIL,
      `Error approving workflow instance ${workflowInstance.id}`,
      `Failed to set the corresponding WooCommerce order's status to "PROCESSING". This was the error: ${error}`
    );
  }
}

async function doWorkflowDeniedAction(workflowInstance: OrderWorkflowInstance) {
  console.log(
    `=====================Marking workflow instance ${workflowInstance.id} as "DENIED"`
  );
  await setWorkflowInstanceStatus(workflowInstance.id, "finished");
}

async function doCancelOrderAction(workflowInstance: OrderWorkflowInstance) {
  console.log(
    `========================Canceling WooCommerce order ${workflowInstance.wooCommerceOrderId}`
  );
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
  } catch (error) {
    console.error(error);
  }
}
