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
  markWorkflowInstanceFinished,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { OrderWorkflowEventType, OrderWorkflowUserRole } from "@/types/types";
import { parseWooCommerceOrderJson } from "@/types/validations";
import { decrypt } from "@/utility/misc";
import {
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowUser,
  Webstore,
} from "@prisma/client";

type StartWorkflowParams = {
  webhookSource: string;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
};
export async function startOrderWorkflow(params: StartWorkflowParams) {
  const { workflowInstance } = await setupOrderWorkflow(params);
  handleCurrentStep(workflowInstance);
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
  doStepAction(currentStep, workflowInstance);

  if (currentStep.proceedImmediatelyTo !== null) {
    handleWorkflowProceed(
      workflowInstance.id,
      currentStep.proceedImmediatelyTo
    );
  }
}

function doStepAction(
  step: OrderWorkflowStep,
  workflowInstance: OrderWorkflowInstance
) {
  const { actionMessage, actionTarget, actionType } = step;
  if (actionType === "email") {
    if (actionTarget === "approver") {
      console.log(
        "====================Emailing all approvers: ",
        actionMessage
      );
    } else if (actionTarget === "purchaser") {
      console.log(
        "=====================Emailing the purchaser: ",
        actionMessage
      );
    } else {
      throw new Error(
        `Unrecognized email target "${actionTarget}" of step ${step.id} in workflow instance ${workflowInstance.id}`
      );
    }
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
  source: OrderWorkflowUserRole
) {
  const workflowInstance = await getWorkflowInstance(workflowInstanceId);
  if (!workflowInstance)
    throw new Error(`Workflow instance ${workflowInstanceId} not found`);

  if (workflowInstance.status === "finished") {
    console.warn(
      `Received event for workflow instance ${workflowInstanceId}, but that workflow is already finished; ignoring.`
    );
    return;
  }

  const currentStep = await getWorkflowInstanceCurrentStep(workflowInstanceId);
  const matchingListener = currentStep.proceedListeners.find(
    (listener) => listener.type === type && listener.from === source
  );
  if (matchingListener)
    handleWorkflowProceed(workflowInstanceId, matchingListener.goto);
  else if (source === "approver" || source === "purchaser") {
    //There may be more sources in the future, but anytime the source is a user and we reach this point,
    //it means the user tried to move the workflow along and it failed, so we need to know.
    //This might happen when we forget to add all the necessary event listeners to a step.
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
      await markWorkflowInstanceFinished(workflowInstance.id);
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
