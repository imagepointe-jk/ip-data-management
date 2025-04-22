import { prisma } from "@/../prisma/client";
// import { OrderWorkflowUserRole } from "@/types/schema/orderApproval";
import { createRandomDigitString } from "@/utility/misc";
import { Webstore } from "@prisma/client";

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
  userRoles: {
    include: {
      user: true,
    },
  },
  roles: {
    include: {
      users: true,
    },
  },
  shippingSettings: true,
  shippingMethods: true,
  checkoutFields: true,
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

export async function getShippingMethods() {
  return prisma.webstoreShippingMethod.findMany();
}

export async function getUser(webstoreId: number, email: string) {
  return prisma.orderWorkflowUser.findUnique({
    where: {
      email,
    },
  });
}

export async function getAllApproversFor(webstoreId: number) {
  return prisma.orderWorkflowUser.findMany({
    where: {
      roles: {
        some: {
          AND: [
            {
              webstore: {
                id: webstoreId,
              },
            },
            {
              role: "approver",
            },
          ],
        },
      },
    },
  });
}

// export async function createUser(
//   email: string,
//   name: string,
//   webstoreId: number,
//   role: OrderWorkflowUserRole
// ) {
//   return prisma.orderWorkflowUser.create({
//     data: {
//       email,
//       name,
//       roles: {
//         create: {
//           webstoreId,
//           role,
//         },
//       },
//     },
//   });
// }

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

export async function getWorkflowInstanceByOrderId(orderId: number) {
  return prisma.orderWorkflowInstance.findUnique({
    where: {
      wooCommerceOrderId: orderId,
    },
  });
}

export async function getWorkflowInstanceWithIncludes(id: number) {
  return prisma.orderWorkflowInstance.findUnique({
    where: {
      id,
    },
    include: {
      accessCodes: {
        include: {
          user: true,
        },
      },
      approvedByUser: true,
      deniedByUser: true,
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
      webstore: {
        include: {
          userRoles: {
            include: {
              user: true,
            },
          },
          roles: {
            include: {
              users: true,
            },
          },
          checkoutFields: true,
        },
      },
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
      simplePin: createRandomDigitString(6),
    },
  });
}

const accessCodeIncludes = {
  user: true,
  workflowInstance: {
    include: {
      parentWorkflow: {
        include: {
          webstore: {
            include: {
              shippingMethods: true,
              shippingSettings: true,
              checkoutFields: true,
            },
          },
        },
      },
      approvedByUser: true,
      deniedByUser: true,
    },
  },
};
export async function getAccessCodeWithIncludes(accessCode: string) {
  return prisma.orderWorkflowAccessCode.findFirst({
    where: {
      guid: accessCode,
    },
    include: accessCodeIncludes,
  });
}

export async function getAccessCodeWithIncludesByOrderAndEmail(
  orderId: number,
  userEmail: string
) {
  return prisma.orderWorkflowAccessCode.findFirst({
    where: {
      AND: [
        {
          workflowInstance: {
            wooCommerceOrderId: orderId,
          },
        },
        {
          user: {
            email: userEmail,
          },
        },
      ],
    },
    include: accessCodeIncludes,
  });
}

export async function setWorkflowInstanceStatus(
  id: number,
  status: "waiting" | "finished"
) {
  return prisma.orderWorkflowInstance.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function setWorkflowInstanceDeniedData(
  id: number,
  reason: string | null,
  deniedByUserEmail: string | null
) {
  return prisma.orderWorkflowInstance.update({
    where: {
      id,
    },
    data: {
      deniedReason: reason,
      deniedByUserEmail,
    },
  });
}

export async function setWorkflowInstanceApprovedData(
  id: number,
  comments: string | null,
  approvedByUserEmail: string | null
) {
  return prisma.orderWorkflowInstance.update({
    where: {
      id,
    },
    data: {
      approvedComments: comments,
      approvedByUserEmail,
    },
  });
}

export async function updateWorkflowInstanceLastStartedDate(id: number) {
  await prisma.orderWorkflowInstance.update({
    where: {
      id,
    },
    data: {
      lastStartedAt: new Date(),
    },
  });
}

export async function createWebstore(
  data: Omit<Webstore, "id">,
  allowApproverChangeMethod: boolean,
  allowUpsToCanada: boolean,
  shippingMethodIds: number[]
) {
  // const {apiKey, apiKeyEncryptIv, apiKeyEncryptTag, apiSecret, apiSecretEncryptIv, apiSecretEncryptTag, name, organizationName, url} = data;

  const webstore = await prisma.webstore.create({
    data: {
      ...data,
      shippingMethods: {
        connect: shippingMethodIds.map((id) => ({ id })),
      },
    },
  });

  await prisma.webstoreShippingSettings.create({
    data: {
      webstoreId: webstore.id,
      allowApproverChangeMethod,

      allowUpsToCanada,
    },
  });

  return webstore;
}

export async function getWorkflowStepByNumber(
  workflowId: number,
  stepNumber: number
) {
  return await prisma.orderWorkflowStep.findFirst({
    where: {
      workflowId,
      order: stepNumber,
    },
  });
}

// export async function getWorkflowInstancePurchaser(instanceId: number) {
//   //assume for now that a workflow instance will only have one purchaser
//   return prisma.orderWorkflowUser.findFirst({
//     where: {
//       AND: [
//         {
//           accessCodes: {
//             some: {
//               instanceId,
//             },
//           },
//         },
//         {
//           roles: {
//             some: {
//               role: "purchaser",
//             },
//           },
//         },
//       ],
//     },
//   });
// }
