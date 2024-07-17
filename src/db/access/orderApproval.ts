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

export async function getWorkflowInstance(id: number) {
  const instance = await prisma.orderWorkflowInstance.findUnique({
    where: {
      id,
    },
  });
  if (!instance) throw new Error(`No workflow instance with id ${id}`);

  const parent = await prisma.orderWorkflow.findUnique({
    where: {
      id: instance.parentWorkflowId,
    },
    include: {
      steps: {
        include: {
          proceedListeners: true,
        },
      },
    },
  });
  if (!parent)
    throw new Error(`No workflow with id ${instance.parentWorkflowId}`);

  return {
    ...instance,
    steps: parent.steps,
  };
}

export async function setWorkflowInstanceCurrentStep(
  id: number,
  value: number
) {
  return prisma.orderWorkflowInstance.update({
    where: {
      id,
    },
    data: {
      currentStep: value,
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

export async function getAccessCodeWithIncludes(accessCode: string) {
  return prisma.orderWorkflowAccessCode.findFirst({
    where: {
      guid: accessCode,
    },
    include: {
      user: true,
      workflowInstance: {
        include: {
          parentWorkflow: {
            include: {
              webstore: true,
            },
          },
        },
      },
    },
  });
}
