"use server";

import { prisma } from "../../../prisma/client";

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

export async function deleteEventListener(id: number) {
  await prisma.orderWorkflowStepProceedListener.delete({
    where: {
      id,
    },
  });
}

export async function deleteStep(id: number) {
  const targetStep = await prisma.orderWorkflowStep.findUnique({
    where: {
      id,
    },
  });
  if (!targetStep) throw new Error(`Step ${id} not found.`);

  const allWorkflowSteps = await prisma.orderWorkflowStep.findMany({
    where: {
      workflowId: targetStep.workflowId,
    },
    include: {
      proceedListeners: true,
    },
  });

  //update the order of any steps after the target step to prevent the sequential order of the workflow from getting messed up
  const stepOrderUpdates = allWorkflowSteps
    .filter((otherStep) => otherStep.order > targetStep.order)
    .map((step) => ({ id: step.id, order: step.order - 1 }));

  //update any steps or listeners that reference the deleted step to prevent broken references
  const stepProceedUpdates = allWorkflowSteps
    .filter((step) => {
      const proceedNumber = +`${step.proceedImmediatelyTo}`;
      if (isNaN(proceedNumber)) return false;
      return proceedNumber === targetStep.order;
    })
    .map((step) => ({ id: step.id, proceedImmediatelyTo: "next" }));
  const listenerGotoUpdates = allWorkflowSteps
    .map((step) => step.proceedListeners)
    .flat()
    .filter((listener) => {
      const gotoNumber = +listener.goto;
      if (isNaN(gotoNumber)) return false;
      return gotoNumber === targetStep.order;
    })
    .map((listener) => ({
      id: listener.id,
      stepId: listener.stepId,
      goto: "next",
    }));

  //perform the deletion and related updates as a single transaction
  await prisma.$transaction([
    prisma.orderWorkflowStep.delete({
      where: {
        id,
      },
    }),
    ...stepOrderUpdates.map((update) =>
      prisma.orderWorkflowStep.update({
        where: {
          id: update.id,
        },
        data: {
          order: update.order,
        },
      })
    ),
    ...stepProceedUpdates.map((update) =>
      prisma.orderWorkflowStep.update({
        where: {
          id: update.id,
        },
        data: {
          proceedImmediatelyTo: update.proceedImmediatelyTo,
        },
      })
    ),
    ...listenerGotoUpdates.map((update) =>
      prisma.orderWorkflowStepProceedListener.update({
        where: {
          id: update.id,
        },
        data: {
          goto: update.goto,
        },
      })
    ),
  ]);
}
