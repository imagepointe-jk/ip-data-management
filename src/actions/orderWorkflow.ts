"use server";

import { prisma } from "../../prisma/client";
import { handleWorkflowEvent } from "@/order-approval/main";
import { OrderWorkflowEventType, OrderWorkflowUserRole } from "@/types/schema";
import { validateWorkflowFormData } from "@/types/validations";

export async function deleteWorkflowInstance(id: number) {
  await prisma.orderWorkflowAccessCode.deleteMany({
    where: {
      instanceId: id,
    },
  });
  return prisma.orderWorkflowInstance.delete({
    where: {
      id,
    },
  });
}

export async function receiveWorkflowEvent(
  accessCode: string,
  type: OrderWorkflowEventType
) {
  try {
    const foundAccessCode = await prisma.orderWorkflowAccessCode.findFirst({
      where: {
        guid: accessCode,
      },
    });
    if (!foundAccessCode) throw new Error("Access code not found.");

    await handleWorkflowEvent(
      foundAccessCode.instanceId,
      type,
      foundAccessCode.userRole as OrderWorkflowUserRole
    );
  } catch (error) {
    console.error(error);
    //don't send the full error details to the client
    throw new Error("Server error.");
  }
}

export async function createWorkflow(formData: FormData) {}

export async function updateWorkflow(formData: FormData) {
  const parsed = validateWorkflowFormData(formData);
  if (!parsed.existingWorkflowId)
    throw new Error("No existing workflow id provided. This is a bug.");

  for (const step of parsed.steps) {
    const {
      name,
      actionMessage,
      actionTarget,
      actionType,
      id,
      proceedImmediatelyTo,
    } = step;
    await prisma.orderWorkflowStep.update({
      where: {
        id,
      },
      data: {
        name,
        actionType,
        actionTarget,
        actionMessage,
        proceedImmediatelyTo:
          proceedImmediatelyTo !== undefined ? proceedImmediatelyTo : null,
      },
    });

    for (const listener of step.proceedListeners) {
      const { from, goto, id, name, type } = listener;
      await prisma.orderWorkflowStepProceedListener.update({
        where: {
          id,
        },
        data: {
          from,
          goto,
          name,
          type,
        },
      });
    }
  }
}

export async function createEventListener(parentStepId: number) {
  await prisma.orderWorkflowStepProceedListener.create({
    data: {
      stepId: parentStepId,
      name: "New Listener",
      type: "approve",
      from: "approver",
      goto: "next",
    },
  });
}

export async function deleteEventListener(id: number) {
  await prisma.orderWorkflowStepProceedListener.delete({
    where: {
      id,
    },
  });
}

export async function createStep(parentWorkflowId: number, order?: number) {
  await prisma.orderWorkflowStep.create({
    data: {
      workflowId: parentWorkflowId,
      name: "New Step",
      actionType: "email",
      order: order || 0,
      actionMessage: "Your message here",
      actionTarget: "approver",
      proceedImmediatelyTo: "next",
    },
  });
}

export async function deleteStep(id: number) {
  await prisma.orderWorkflowStep.delete({
    where: {
      id,
    },
  });
}
