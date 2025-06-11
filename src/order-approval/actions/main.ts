import { OrderWorkflowActionType } from "@/types/schema/orderApproval";
import { OrderWorkflowInstance, OrderWorkflowStep } from "@prisma/client";
import { doEmailAction } from "./email";
import { doWorkflowApprovedAction } from "./approve";
import { doWorkflowDeniedAction } from "./deny";
import { doCancelOrderAction } from "./cancel";

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
