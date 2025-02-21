"use server";

import { validateWebstoreFormData } from "@/types/validations/orderApproval";
import { prisma } from "../../../prisma/client";
import { encrypt } from "@/utility/misc";
import {
  createWebstore as createDbWebstore,
  getWebstoreById,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";

export async function createWorkflow(webstoreId: number, name: string) {
  await prisma.orderWorkflow.create({
    data: {
      name,
      webstoreId,
    },
  });
}

export async function duplicateWorkflow(
  workflowId: number,
  targetWebstoreId: number
) {
  const existingWorkflow = await getWorkflowWithIncludes(workflowId);
  if (!existingWorkflow) throw new Error(`Workflow ${workflowId} not found.`);

  const webstore = await getWebstoreById(targetWebstoreId);
  if (!webstore) throw new Error(`Webstore ${targetWebstoreId} not found.`);

  //check to make sure the target webstore is in a valid state to accept the duplicated workflow
  for (const step of existingWorkflow.steps) {
    const actionTargetIsEmail = step.actionTarget?.includes("@"); //assume only email addresses will have an @
    if (actionTargetIsEmail) {
      const existingUser = await prisma.orderWorkflowUser.findFirst({
        where: {
          AND: [
            {
              email: `${step.actionTarget}`,
            },
            {
              webstore: {
                some: {
                  id: targetWebstoreId,
                },
              },
            },
          ],
        },
      });
      if (!existingUser)
        throw new Error(
          `Step with ID ${step.id} of existing workflow ${existingWorkflow.id} targets ${step.actionTarget}, but no user with that email address is associated with target webstore ${webstore.id}.`
        );
    }

    for (const listener of step.proceedListeners) {
      const fromValueIsEmail = listener.from.includes("@"); //assume only email addresses will have an @
      if (fromValueIsEmail) {
        const existingUser = await prisma.orderWorkflowUser.findFirst({
          where: {
            AND: [
              {
                email: listener.from,
              },
              {
                webstore: {
                  some: {
                    id: targetWebstoreId,
                  },
                },
              },
            ],
          },
        });
        if (!existingUser)
          throw new Error(
            `Step with ID ${step.id} of existing workflow ${existingWorkflow.id} has a proceed listener with ID ${listener.id} with a "from" value of ${listener.from}, but no user with that email address is associated with target webstore ${webstore.id}.`
          );
      }
    }
  }

  //the checks have passed, so let's create the workflow using the existing data
  const newWorkflow = await prisma.orderWorkflow.create({
    data: {
      name: existingWorkflow.name,
      webstore: {
        connect: {
          id: webstore.id,
        },
      },
    },
  });

  for (const step of existingWorkflow.steps) {
    await prisma.orderWorkflowStep.create({
      data: {
        actionType: step.actionType,
        name: step.name,
        order: step.order,
        actionMessage: step.actionMessage,
        actionSubject: step.actionSubject,
        actionTarget: step.actionTarget,
        otherActionTargets: step.otherActionTargets,
        proceedImmediatelyTo: step.proceedImmediatelyTo,
        workflow: {
          connect: {
            id: newWorkflow.id,
          },
        },
        proceedListeners: {
          createMany: {
            data: step.proceedListeners.map((listener) => ({
              from: listener.from,
              goto: listener.goto,
              name: listener.name,
              type: listener.type,
            })),
          },
        },
      },
    });
  }

  return newWorkflow;
}

export async function createEventListener(
  parentStepId: number,
  fromValue: string
) {
  await prisma.orderWorkflowStepProceedListener.create({
    data: {
      stepId: parentStepId,
      name: "New Listener",
      type: "approve",
      from: fromValue,
      goto: "next",
    },
  });
}

export async function createStep(parentWorkflowId: number, order?: number) {
  await prisma.orderWorkflowStep.create({
    data: {
      workflowId: parentWorkflowId,
      name: "New Step",
      actionType: "email",
      order: order || 0,
      actionMessage: "Your message here",
      actionSubject: "Your Subject Here",
      proceedImmediatelyTo: "next",
    },
  });
}

export async function createWebstore(formData: FormData) {
  const {
    changeApiKey,
    changeApiSecret,
    name,
    orgName: organizationName,
    url,
    salesPersonName,
    salesPersonEmail,
    otherSupportEmails,
    orderUpdatedEmails,
    allowApproverChangeMethod,
    allowUpsToCanada,
    shippingMethodIds,
    customOrderApprovedEmail,
    useCustomOrderApprovedEmail,
  } = validateWebstoreFormData(formData);
  const {
    ciphertext: apiKey,
    iv: apiKeyEncryptIv,
    tag: apiKeyEncryptTag,
  } = encrypt(changeApiKey);
  const {
    ciphertext: apiSecret,
    iv: apiSecretEncryptIv,
    tag: apiSecretEncryptTag,
  } = encrypt(changeApiSecret);

  return createDbWebstore(
    {
      apiKey,
      apiKeyEncryptIv,
      apiKeyEncryptTag: apiKeyEncryptTag.toString("base64"),
      apiSecret,
      apiSecretEncryptIv,
      apiSecretEncryptTag: apiSecretEncryptTag.toString("base64"),
      name,
      organizationName,
      url,
      salesPersonName,
      salesPersonEmail,
      otherSupportEmails,
      orderUpdatedEmails,
      useCustomOrderApprovedEmail,
      customOrderApprovedEmail,
    },
    allowApproverChangeMethod,
    allowUpsToCanada,
    shippingMethodIds
  );
}

export async function createOrConnectWebstoreUser(
  webstoreId: number,
  name: string,
  email: string
) {
  const existingUser = await prisma.orderWorkflowUser.findUnique({
    where: {
      email,
    },
  });
  if (existingUser)
    return prisma.orderWorkflowUser.update({
      where: {
        id: existingUser.id,
      },
      data: {
        webstore: {
          connect: {
            id: webstoreId,
          },
        },
      },
    });
  else
    return prisma.orderWorkflowUser.create({
      data: {
        name,
        email,
        webstore: {
          connect: {
            id: webstoreId,
          },
        },
      },
    });
}
