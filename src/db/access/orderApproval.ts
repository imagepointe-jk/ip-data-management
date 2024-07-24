import { prisma } from "@/../prisma/client";
import { OrderWorkflowInstance, Webstore } from "@prisma/client";

export async function getWebstore(url: string) {
  return prisma.webstore.findUnique({
    where: {
      url,
    },
  });
}

const webstoreIncludes = {
  workflows: {
    include: {
      instances: true,
    },
  },
  users: true,
};
export async function getWebstoreById(id: number) {
  return prisma.webstore.findUnique({
    where: {
      id,
    },
  });
}

export async function getWebstoreWithIncludes(id: number) {
  return prisma.webstore.findUnique({
    where: {
      id,
    },
    include: webstoreIncludes,
  });
}

export async function getWebstores() {
  return prisma.webstore.findMany();
}

export async function getWebstoresWithIncludes() {
  return prisma.webstore.findMany({
    include: webstoreIncludes,
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

export async function getFirstApproverFor(webstoreId: number) {
  return prisma.orderWorkflowUser.findFirst({
    where: {
      webstoreId,
      isApprover: true,
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

export async function getWorkflowsWithIncludes() {
  return prisma.orderWorkflow.findMany({
    include: {
      webstore: true,
      instances: true,
      steps: true,
    },
  });
}

export async function getWorkflowInstance(id: number) {
  return prisma.orderWorkflowInstance.findUnique({
    where: {
      id,
    },
  });
}

export async function getWorkflowWithIncludes(id: number) {
  return prisma.orderWorkflow.findUnique({
    where: {
      id,
    },
    include: {
      steps: {
        include: {
          proceedListeners: true,
        },
      },
      instances: true,
    },
  });
}

export async function getWorkflowInstanceCurrentStep(
  workflowInstanceId: number
) {
  const instance = await getWorkflowInstance(workflowInstanceId);
  if (!instance)
    throw new Error(`Workflow instance ${workflowInstanceId} not found`);

  const workflowWithSteps = await getWorkflowWithIncludes(
    instance.parentWorkflowId
  );
  if (!workflowWithSteps)
    throw new Error(`No parent workflow found for ${workflowInstanceId}`);

  const currentStep = workflowWithSteps.steps.find(
    (step) => step.order === instance.currentStep
  );
  if (!currentStep)
    throw new Error(
      `Current step is out-of-bounds on workflow instance ${workflowInstanceId}.`
    );

  return currentStep;
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

export async function markWorkflowInstanceFinished(id: number) {
  return prisma.orderWorkflowInstance.update({
    where: {
      id,
    },
    data: {
      status: "finished",
    },
  });
}

export async function createWebstore(data: Omit<Webstore, "id">) {
  // const {apiKey, apiKeyEncryptIv, apiKeyEncryptTag, apiSecret, apiSecretEncryptIv, apiSecretEncryptTag, name, organizationName, url} = data;

  return prisma.webstore.create({
    data,
  });
}
