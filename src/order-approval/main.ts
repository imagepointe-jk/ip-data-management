import {
  createAccessCode,
  createUser,
  createWorkflowInstance,
  getFirstWorkflowForWebstore,
  getWebstore,
  getUser,
  getWorkflowInstance,
  setWorkflowInstanceCurrentStep,
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
  const {
    approver,
    approverAccessCode,
    webstore,
    purchaser,
    purchaserAccessCode,
    workflowInstance,
  } = await setupOrderWorkflow(params);

  console.log(
    `Finished setup on workflow instance ${workflowInstance.id} for webstore ${webstore.id}.`
  );

  handleCurrentStep(workflowInstance.id);
}

async function setupOrderWorkflow(params: StartWorkflowParams) {
  const { email, firstName, lastName, orderId, webhookSource } = params;
  console.log("=====================started workflow");
  const webstore = await getWebstore(webhookSource);
  if (!webstore)
    throw new Error(`No webstore was found with url ${webhookSource}`);

  const purchaser =
    (await getUser(webstore.id, email)) ||
    (await createUser(email, `${firstName} ${lastName}`, webstore.id));

  //! approver will need to no longer be hard-coded if we decide to use this with different organizations
  //! This has not been implemented now because of too many uncertainties (will webstores have multiple approvers, etc.)
  const approver = await getUser(webstore.id, "approver-email@example.com");
  if (!approver)
    throw new Error(`No approver was found for webstore ${webstore.name}`);

  //! assume for now that a webstore will only have one workflow for all orders
  const workflow = await getFirstWorkflowForWebstore(webstore.id);
  if (!workflow)
    throw new Error(`No workflow found for webstore ${webstore.name}`);

  const workflowInstance = await createWorkflowInstance(workflow.id, orderId);
  const purchaserAccessCode = await createAccessCode(
    workflowInstance.id,
    purchaser.id,
    "purchaser"
  );
  const approverAccessCode = await createAccessCode(
    workflowInstance.id,
    approver.id,
    "approver"
  );

  return {
    webstore,
    purchaser,
    approver,
    workflowInstance,
    purchaserAccessCode,
    approverAccessCode,
  };
}

//! This function is recursive and assumes there will be no circularity in the workflow step sequence.
//! There should be a check in place for this somewhere.
async function handleCurrentStep(workflowInstanceId: number) {
  const workflowInstance = await getWorkflowInstance(workflowInstanceId);
  const currentStep = workflowInstance.steps.find(
    (step) => step.order === workflowInstance.currentStep
  );
  if (!currentStep) {
    console.log(
      `========================Reached the end of workflow ${workflowInstanceId}`
    );
    return;
  }

  const { actionMessage, actionTarget, actionType, proceedImmediatelyTo } =
    currentStep;

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
        `Unrecognized email target "${actionTarget}" of step ${currentStep.id} in workflow instance ${workflowInstance.id}`
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
      `Unrecognized action type "${actionType}" of step ${currentStep.id} in workflow instance ${workflowInstance.id}`
    );
  }

  if (proceedImmediatelyTo !== null) {
    handleWorkflowProceed(workflowInstance, proceedImmediatelyTo);
    return;
  }
}

export async function handleWorkflowEvent(
  workflowInstanceId: number,
  type: OrderWorkflowEventType,
  source: OrderWorkflowUserRole
) {
  const workflowInstance = await getWorkflowInstance(workflowInstanceId);
  if (workflowInstance.status === "finished") {
    console.warn(
      `Received event for workflow instance ${workflowInstanceId}, but that workflow is already finished; ignoring.`
    );
  }

  const currentStep = workflowInstance.steps.find(
    (step) => step.order === workflowInstance.currentStep
  );
  if (!currentStep) {
    throw new Error(
      `Current step is out-of-bounds on workflow instance ${workflowInstanceId}.`
    );
  }

  const matchingListener = currentStep.proceedListeners.find(
    (listener) => listener.type === type && listener.from === source
  );
  if (matchingListener)
    handleWorkflowProceed(workflowInstance, matchingListener.goto);
  else if (source === "approver" || source === "purchaser") {
    throw new Error(
      `The workflow instance ${workflowInstance.id} received an unhandled event of type ${type} from ${source}.`
    );
  }
}

async function handleWorkflowProceed(
  workflowInstance: OrderWorkflowInstance,
  goto: string
) {
  const newCurrentStep =
    goto === "next" ? workflowInstance.currentStep + 1 : +goto;
  if (isNaN(newCurrentStep)) {
    throw new Error(
      `Invalid goto value "${goto}" attempted in workflow instance ${workflowInstance.id}`
    );
  }

  await setWorkflowInstanceCurrentStep(workflowInstance.id, newCurrentStep);
  handleCurrentStep(workflowInstance.id);
}
