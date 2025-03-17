import {
  createAccessCode,
  createUser,
  createWorkflowInstance,
  getFirstWorkflowForWebstore,
  getWebstore,
  getUser,
  getWorkflowInstance,
  setWorkflowInstanceCurrentStep,
  getWorkflowWithIncludes,
  getWorkflowInstanceCurrentStep,
  setWorkflowInstanceStatus,
  updateWorkflowInstanceLastStartedDate,
  getWorkflowInstancePurchaser,
  setWorkflowInstanceDeniedReason,
  getAllApproversFor,
  getAccessCodeWithIncludesByOrderAndEmail,
} from "@/db/access/orderApproval";
import { getOrder, setOrderStatus } from "@/fetch/woocommerce";
import { sendEmail } from "@/utility/mail";
import { getEnvVariable } from "@/utility/misc";
import { OrderWorkflowInstance, OrderWorkflowStep } from "@prisma/client";
import {
  createOrderUpdatedEmail,
  createShippingEmail,
  processFormattedText,
} from "./mail/mail";
import { decryptWebstoreData } from "./encryption";
import {
  OrderWorkflowActionType,
  OrderWorkflowEventType,
} from "@/types/schema/orderApproval";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { AppError } from "@/error";
import { env } from "@/env";

type StartWorkflowParams = {
  webhookSource: string;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
};
export async function startOrderWorkflow(params: StartWorkflowParams) {
  try {
    console.log(`Setting up workflow isntance for WC order ${params.orderId}`);
    const { workflowInstance } = await setupOrderWorkflow(params);
    // handleCurrentStep(workflowInstance);
    console.log("Starting workflow from beginning");
    startWorkflowInstanceFromBeginning(workflowInstance.id);
  } catch (error) {
    sendEmail(
      env.DEVELOPER_EMAIL,
      "Error starting workflow",
      `An error occurred while trying to start a workflow instance for WooCommerce order ${params.orderId}. This was the error: ${error}`
    );
    console.error(
      `An error occurred while trying to start a workflow instance for WooCommerce order ${params.orderId}.`
    );
    if (error instanceof Error) throw error;
    else throw new Error("Unknown error while starting the workflow instance.");
  }
}

export async function startWorkflowInstanceFromBeginning(id: number) {
  const instance = await getWorkflowInstance(id);
  if (!instance) throw new Error(`Workflow instance ${id} not found.`);
  const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
  if (!workflow)
    throw new Error(`Workflow ${instance.parentWorkflowId} not found.`);

  const sortedSteps = [...workflow.steps];
  sortedSteps.sort((a, b) => a.order - b.order);
  const lowestStep = sortedSteps[0];
  const lowestStepOrder = lowestStep ? lowestStep.order : 0;
  await setWorkflowInstanceCurrentStep(instance.id, lowestStepOrder);
  await setWorkflowInstanceStatus(instance.id, "waiting");
  await updateWorkflowInstanceLastStartedDate(instance.id);

  try {
    const { key, secret } = decryptWebstoreData(workflow.webstore);
    const response = await setOrderStatus(
      instance.wooCommerceOrderId,
      workflow.webstore.url,
      key,
      secret,
      "on-hold"
    );
    if (!response.ok)
      throw new Error(`The API responded with a ${response.status} status.`);
  } catch (error) {
    sendEmail(
      env.DEVELOPER_EMAIL,
      `Error starting workflow instance ${id}`,
      `Failed to set the corresponding WooCommerce order's status to "ON HOLD". This was the error: ${error}`
    );
  }

  handleCurrentStep(instance);
}

async function setupOrderWorkflow(params: StartWorkflowParams) {
  const { email, firstName, lastName, orderId, webhookSource } = params;

  console.log("getting webstore");
  const webstore = await getWebstore(webhookSource);
  if (!webstore)
    throw new Error(`No webstore was found with url ${webhookSource}`);

  console.log("getting or creating purchaser");
  //try to get a user, or immediately create one if not found.
  const purchaser =
    (await getUser(webstore.id, email)) ||
    (await createUser(
      email,
      `${firstName} ${lastName}`,
      webstore.id,
      "purchaser"
    ));

  console.log("getting approvers");
  //Assume for now that a webstore will only have one approver
  const approvers = await getAllApproversFor(webstore.id);
  if (approvers.length === 0)
    throw new Error(`No approver was found for webstore ${webstore.name}`);

  console.log("getting first workflow");
  //assume for now that a webstore will only have one workflow for all orders
  const workflow = await getFirstWorkflowForWebstore(webstore.id);
  if (!workflow)
    throw new Error(`No workflow found for webstore ${webstore.name}`);

  console.log("creating workflow isntance");
  const workflowInstance = await createWorkflowInstance(workflow.id, orderId);
  console.log("creating access code for purchaser");
  await createAccessCode(workflowInstance.id, purchaser.id, "purchaser");
  console.log("creating access codes for approvers");
  for (const approver of approvers) {
    await createAccessCode(workflowInstance.id, approver.id, "approver");
  }

  console.log(
    `Finished setup on workflow instance ${workflowInstance.id} for webstore ${webstore.id}.`
  );
  return {
    workflowInstance,
  };
}

//! This function is indirectly recursive via "handleWorkflowProceed" and assumes there will be no circularity in the workflow step sequence.
//! There should be a check in place for this somewhere.
async function handleCurrentStep(workflowInstance: OrderWorkflowInstance) {
  const currentStep = await getWorkflowInstanceCurrentStep(workflowInstance.id);
  await doStepAction(currentStep, workflowInstance);

  if (currentStep.proceedImmediatelyTo !== null) {
    handleWorkflowProceed(
      workflowInstance.id,
      currentStep.proceedImmediatelyTo
    );
  }
}

async function doStepAction(
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
      ? (await getWorkflowInstancePurchaser(workflowInstance.id))?.email
      : actionTarget;
  if (!targetPrimary)
    throw new Error(
      `Workflow instance ${workflowInstance.id} tried to send an email to an invalid target!`
    );
  const otherTargets = step.otherActionTargets
    ? step.otherActionTargets.split(";")
    : [];
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

    await sendEmail(
      target,
      actionSubject || "Order Update",
      prepend + processedMessage
    );
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
  const {
    webstore: { useCustomOrderApprovedEmail, customOrderApprovedEmail },
  } = parentWorkflow;
  const shippingEmail = getEnvVariable("IP_SHIPPING_EMAIL");

  const shippingMessage = useCustomOrderApprovedEmail
    ? await processFormattedText(
        customOrderApprovedEmail || "",
        workflowInstance.id,
        shippingEmail
      )
    : await createShippingEmail(workflowInstance.id);

  await sendEmail(
    shippingEmail,
    `Order ${workflowInstance.wooCommerceOrderId} Approved`,
    shippingMessage,
    [],
    {
      autoLineBreaks: useCustomOrderApprovedEmail === true,
    }
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
  //the denied reason is only in-scope when the "Deny" event is received,
  //so that data is recorded during handleWorkflowEvent.
  //Currently the only thing distinguishing a "finished approved" instance from a "finished denied" instance
  //is this reason, but that may change in future.
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

export async function handleWorkflowEvent(
  workflowInstanceId: number,
  type: OrderWorkflowEventType,
  source: string,
  message?: string
) {
  const workflowInstance = await getWorkflowInstance(workflowInstanceId);
  if (!workflowInstance)
    throw new Error(`Workflow instance ${workflowInstanceId} not found`);

  if (workflowInstance.status === "finished") {
    throw new Error(
      `Received event for workflow instance ${workflowInstanceId}, but that workflow is already finished.`
    );
  }

  const currentStep = await getWorkflowInstanceCurrentStep(workflowInstanceId);
  const matchingListener = currentStep.proceedListeners.find(
    (listener) => listener.type === type && listener.from === source
  );
  if (matchingListener) {
    if (matchingListener.type === "deny") {
      //the reason is only in-scope when the "deny" event is received.
      //handle all other step behavior (e.g. marking as "finished") in doStepAction.
      await setWorkflowInstanceDeniedReason(
        workflowInstanceId,
        message || "(NO REASON GIVEN. This is a bug.)"
      );
    }
    handleWorkflowProceed(workflowInstanceId, matchingListener.goto);
  } else {
    throw new Error(
      `The workflow instance ${workflowInstanceId} received an unhandled event of type ${type} from ${source}.`
    );
  }
}

async function handleWorkflowProceed(workflowInstanceId: number, goto: string) {
  const workflowInstance = await getWorkflowInstance(workflowInstanceId);
  if (!workflowInstance)
    throw new Error(`Workflow instance ${workflowInstanceId} not found`);

  if (goto === "next") {
    const parentWorkflow = await getWorkflowWithIncludes(
      workflowInstance.parentWorkflowId
    );
    if (!parentWorkflow)
      throw new Error(`No parent workflow found for ${workflowInstance.id}`);
    const nextStep = parentWorkflow.steps.find(
      (step) => step.order > workflowInstance.currentStep
    );

    if (!nextStep) {
      await setWorkflowInstanceStatus(workflowInstance.id, "finished");
    } else {
      await setWorkflowInstanceCurrentStep(
        workflowInstance.id,
        workflowInstance.currentStep + 1
      );
      handleCurrentStep(workflowInstance);
    }
  } else if (!isNaN(+goto)) {
    await setWorkflowInstanceCurrentStep(workflowInstance.id, +goto);
    handleCurrentStep(workflowInstance);
  } else {
    throw new Error(
      `Invalid goto value "${goto}" attempted in workflow instance ${workflowInstance.id}`
    );
  }
}

export async function handleOrderUpdated(
  order: WooCommerceOrder,
  storeUrl: string,
  userEmail: string
) {
  const webstore = await getWebstore(storeUrl);
  if (!webstore) throw new Error(`No webstore with url ${storeUrl}`);

  const foundCode = await getAccessCodeWithIncludesByOrderAndEmail(
    order.id,
    userEmail
  );
  if (!foundCode)
    throw new Error(
      `No access code found with user email ${userEmail} and order id ${order.id}`
    );

  const purchaser = await getWorkflowInstancePurchaser(
    foundCode.workflowInstance.id
  );
  if (!purchaser)
    throw new Error(
      `No purchaser found for instance ${foundCode.workflowInstance.id}`
    );

  const orderUpdatedEmails = webstore.orderUpdatedEmails
    ? webstore.orderUpdatedEmails.split(";")
    : [];
  orderUpdatedEmails.push(purchaser.email);
  orderUpdatedEmails.push(foundCode.user.email);

  const message = await createOrderUpdatedEmail(order, webstore.name);

  for (const email of orderUpdatedEmails) {
    await sendEmail(email, `Order ${order.id} updated`, message);
  }
}
