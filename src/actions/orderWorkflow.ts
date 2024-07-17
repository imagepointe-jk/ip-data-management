"use server";

import { prisma } from "../../prisma/client";

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
