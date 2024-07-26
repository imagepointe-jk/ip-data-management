import {
  createAccessCode,
  createUser,
  createWorkflowInstance,
  getFirstWorkflowForWebstore,
  getWebstore,
  getUser,
  getWorkflowInstance,
  setWorkflowInstanceCurrentStep,
  getFirstApproverFor,
  getWorkflowWithIncludes,
  getWorkflowInstanceCurrentStep,
  setWorkflowInstanceStatus,
  updateWorkflowInstanceLastStartedDate,
  getWorkflowInstancePurchaser,
  setWorkflowInstanceDeniedReason,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import {
  OrderWorkflowActionType,
  OrderWorkflowEventType,
  OrderWorkflowUserRole,
} from "@/types/schema";
import { sendEmail } from "@/utility/mail";
import { decrypt } from "@/utility/misc";
import {
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowUser,
  Webstore,
} from "@prisma/client";
import { processFormattedText } from "./mail/mail";

type StartWorkflowParams = {
  webhookSource: string;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
};
export async function startOrderWorkflow(params: StartWorkflowParams) {
  const { workflowInstance } = await setupOrderWorkflow(params);
  // handleCurrentStep(workflowInstance);
  startWorkflowInstanceFromBeginning(workflowInstance.id);
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
  handleCurrentStep(instance);
}

async function setupOrderWorkflow(params: StartWorkflowParams) {
  const { email, firstName, lastName, orderId, webhookSource } = params;

  const webstore = await getWebstore(webhookSource);
  if (!webstore)
    throw new Error(`No webstore was found with url ${webhookSource}`);

  //try to get a user, or immediately create one if not found.
  const purchaser =
    (await getUser(webstore.id, email)) ||
    (await createUser(email, `${firstName} ${lastName}`, webstore.id));

  //Assume for now that a webstore will only have one approver
  const approver = await getFirstApproverFor(webstore.id);
  if (!approver)
    throw new Error(`No approver was found for webstore ${webstore.name}`);

  //assume for now that a webstore will only have one workflow for all orders
  const workflow = await getFirstWorkflowForWebstore(webstore.id);
  if (!workflow)
    throw new Error(`No workflow found for webstore ${webstore.name}`);

  const workflowInstance = await createWorkflowInstance(workflow.id, orderId);
  await createAccessCode(workflowInstance.id, purchaser.id, "purchaser");
  await createAccessCode(workflowInstance.id, approver.id, "approver");

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
  const { actionMessage, actionTarget, actionType: a, actionSubject } = step;
  const actionType = a as OrderWorkflowActionType;
  if (actionType === "email") {
    const targetToUse =
      actionTarget === "purchaser"
        ? (await getWorkflowInstancePurchaser(workflowInstance.id))?.email
        : actionTarget;
    if (!targetToUse)
      throw new Error(
        `Workflow instance ${workflowInstance.id} tried to send an email to an invalid target!`
      );
    console.log(
      `=====================Workflow Instance ${workflowInstance.id} sending email to ${actionTarget} (${targetToUse})`
    );
    const processedMessage = await processFormattedText(
      `${actionMessage}`,
      workflowInstance.id,
      targetToUse
    );
    await sendEmail(
      targetToUse,
      actionSubject || "Order Update",
      processedMessage
    );
  } else if (actionType === "mark workflow approved") {
    console.log("marking workflow approved");
  } else if (actionType === "mark workflow denied") {
    console.log("marking workflow denied");
  } else if (actionType === "cancel woocommerce order") {
    console.log("canceling woocommerce order");
  } else {
    throw new Error(
      `Unrecognized action type "${actionType}" of step ${step.id} in workflow instance ${workflowInstance.id}`
    );
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
      await setWorkflowInstanceStatus(workflowInstanceId, "finished");
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
