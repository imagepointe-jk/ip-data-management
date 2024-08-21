import { prisma } from "../../../prisma/client";
import { revalidateStepOrder } from "./misc";

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
  const step = await prisma.orderWorkflowStep.findUnique({
    where: {
      id,
    },
  });
  if (!step) throw new Error(`Step ${id} not found.`);

  await prisma.orderWorkflowStep.delete({
    where: {
      id,
    },
  });
  await revalidateStepOrder(step.workflowId);
}
