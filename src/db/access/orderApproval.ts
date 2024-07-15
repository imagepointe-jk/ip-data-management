import { prisma } from "@/../prisma/client";

export async function getWebstore(url: string) {
  return prisma.webstore.findUnique({
    where: {
      url,
    },
  });
}

export async function getUser(webstoreId: number, email: string) {
  return prisma.orderWorkflowUser.findFirst({
    where: {
      email,
      webstoreId,
    },
  });
}

export async function createUser(
  email: string,
  name: string,
  webstoreId: number
) {
  return prisma.orderWorkflowUser.create({
    data: {
      email,
      name,
      webstoreId,
    },
  });
}

export async function getFirstWorkflowForWebstore(webstoreId: number) {
  return prisma.orderWorkflow.findFirst({
    where: {
      webstoreId,
    },
  });
}

export async function createWorkflowInstance(
  workflowId: number,
  wooCommerceOrderId: number
) {
  return prisma.orderWorkflowInstance.create({
    data: {
      wooCommerceOrderId,
      status: "waiting",
      parentWorkflowId: workflowId,
    },
  });
}

export async function createAccessCode(
  workflowInstanceId: number,
  userId: number,
  userRole: string
) {
  return prisma.orderWorkflowAccessCode.create({
    data: {
      instanceId: workflowInstanceId,
      userId,
      userRole,
    },
  });
}
