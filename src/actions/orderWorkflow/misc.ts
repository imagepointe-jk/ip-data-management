"use server";

import { OrderWorkflowEventType } from "@/types/schema/orderApproval";
import { prisma } from "../../../prisma/client";
import {
  handleWorkflowEvent,
  startWorkflowInstanceFromBeginning,
} from "@/order-approval/main";

export async function receiveWorkflowEvent(
  accessCode: string,
  type: OrderWorkflowEventType,
  message?: string
) {
  try {
    const foundAccessCode = await prisma.orderWorkflowAccessCode.findFirst({
      where: {
        guid: accessCode,
      },
      include: {
        user: true,
      },
    });
    if (!foundAccessCode) throw new Error("Access code not found.");

    await handleWorkflowEvent(
      foundAccessCode.instanceId,
      type,
      foundAccessCode.user.email,
      message
    );
  } catch (error) {
    console.error(error);
    //don't send the full error details to the client
    throw new Error("Server error.");
  }
}

//deleting a step causes a gap in step order (e.g. deleting 3 in 1, 2, 3, 4, 5 yields the sequence 1, 2, 4, 5).
//revalidate so that the step sequence remains sequential and zero-based.
export async function revalidateStepOrder(workflowId: number) {
  const allSteps = await prisma.orderWorkflowStep.findMany({
    where: {
      workflowId,
    },
    orderBy: {
      order: "asc",
    },
  });

  const updates: { id: number; order: number }[] = [];
  for (let i = 0; i < allSteps.length; i++) {
    const step = allSteps[i];
    if (!step) throw new Error(`Invalid step ${i} in array`);

    if (step.order !== i) {
      updates.push({
        id: step.id,
        order: i,
      });
    }
  }

  await Promise.all(
    updates.map((update) =>
      prisma.orderWorkflowStep.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    )
  );
}

export async function restartWorkflow(id: number) {
  await startWorkflowInstanceFromBeginning(id);
}

export async function moveWorkflowStep(
  id: number,
  direction: "earlier" | "later"
) {
  const step = await prisma.orderWorkflowStep.findUnique({
    where: {
      id,
    },
  });
  if (!step) throw new Error(`Step ${id} not found.`);
  const otherStep = await prisma.orderWorkflowStep.findFirst({
    where: {
      order: {
        gt: direction === "later" ? step.order : undefined,
        lt: direction === "earlier" ? step.order : undefined,
      },
    },
    orderBy: {
      order: direction === "later" ? "asc" : "desc",
    },
  });
  if (!otherStep)
    throw new Error(
      `Failed to move step ${id} ${direction} because another step was not found to swap it with.`
    );

  await prisma.orderWorkflowStep.update({
    where: {
      id: step.id,
    },
    data: {
      order: otherStep.order,
    },
  });
  await prisma.orderWorkflowStep.update({
    where: {
      id: otherStep.id,
    },
    data: {
      order: step.order,
    },
  });
}
