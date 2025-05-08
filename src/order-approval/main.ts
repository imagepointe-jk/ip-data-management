import {
  getAccessCodeWithIncludesByOrderAndEmail,
  getWebstore,
  getWorkflowInstance,
  getWorkflowInstanceCurrentStep,
  getWorkflowWithIncludes,
  setWorkflowInstanceApprovedData,
  setWorkflowInstanceCurrentStep,
  setWorkflowInstanceDeniedData,
  setWorkflowInstanceStatus,
} from "@/db/access/orderApproval";
import { OrderWorkflowEventType } from "@/types/schema/orderApproval";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { sendEmail } from "@/utility/mail";
import { OrderWorkflowInstance } from "@prisma/client";
import { doStepAction } from "./actions";
import { createOrderUpdatedEmail } from "./mail/mail";

//! This function is indirectly recursive via "handleWorkflowProceed" and assumes there will be no circularity in the workflow step sequence.
//! There should be a check in place for this somewhere.
export async function handleCurrentStep(
  workflowInstance: OrderWorkflowInstance
) {
  const currentStep = await getWorkflowInstanceCurrentStep(workflowInstance.id);
  await doStepAction(currentStep, workflowInstance);

  if (currentStep.proceedImmediatelyTo !== null) {
    handleWorkflowProceed(
      workflowInstance.id,
      currentStep.proceedImmediatelyTo
    );
  }
}

export async function handleWorkflowEvent(
  workflowInstanceId: number,
  type: OrderWorkflowEventType,
  source: string,
  message: string | null
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
    await handleWorkflowEventDataBeforeProceeding(
      workflowInstanceId,
      type,
      source,
      message
    );
    handleWorkflowProceed(workflowInstanceId, matchingListener.goto);
  } else {
    throw new Error(
      `The workflow instance ${workflowInstanceId} received an unhandled event of type ${type} from ${source}.`
    );
  }
}

//some data from the received event will go out of scope once we move to the next step.
//do whatever is needed with it before proceeding.
async function handleWorkflowEventDataBeforeProceeding(
  workflowInstanceId: number,
  type: string,
  source: string,
  message: string | null
) {
  if (type === "deny") {
    await setWorkflowInstanceDeniedData(
      workflowInstanceId,
      message || "(NO REASON GIVEN. This is a bug.)",
      source
    );
  }
  if (type === "approve") {
    await setWorkflowInstanceApprovedData(
      workflowInstanceId,
      message || null,
      source
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

  const orderUpdatedEmails = webstore.orderUpdatedEmails
    ? webstore.orderUpdatedEmails.split(";")
    : [];
  orderUpdatedEmails.push(foundCode.workflowInstance.purchaserEmail);
  orderUpdatedEmails.push(foundCode.user.email);

  const message = await createOrderUpdatedEmail(order, webstore.name);

  for (const email of orderUpdatedEmails) {
    await sendEmail(email, `Order ${order.id} updated`, message);
  }
}
