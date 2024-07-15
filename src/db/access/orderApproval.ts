import { prisma } from "@/../prisma/client";

export async function getOrganization(url: string) {
  return prisma.organization.findUnique({
    where: {
      url,
    },
  });
}

export async function getUser(organizationId: number, email: string) {
  return prisma.orderWorkflowUser.findFirst({
    where: {
      email,
      organizationId,
    },
  });
}

export async function createUser(
  email: string,
  name: string,
  organizationId: number
) {
  return prisma.orderWorkflowUser.create({
    data: {
      email,
      name,
      organizationId,
    },
  });
}

export async function getFirstWorkflowForOrganization(organizationId: number) {
  return prisma.orderWorkflow.findFirst({
    where: {
      organizationId,
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
