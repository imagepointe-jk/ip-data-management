"use server";

import { OrderWorkflowEventType, OrderWorkflowUserRole } from "@/types/types";
import { prisma } from "../../prisma/client";
import { handleWorkflowEvent } from "@/order-approval/main";

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
