"use server";

import { prisma } from "../../prisma/client";
import {
  handleWorkflowEvent,
  startWorkflowInstanceFromBeginning,
} from "@/order-approval/main";
import { OrderWorkflowEventType, OrderWorkflowUserRole } from "@/types/schema";
import {
  validateWebstoreFormData,
  validateWorkflowFormData,
} from "@/types/validations";
import { encrypt } from "@/utility/misc";
import { createWebstore as createDbWebstore } from "@/db/access/orderApproval";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function createWorkflow(webstoreId: number, name: string) {
  await prisma.orderWorkflow.create({
    data: {
      name,
      webstoreId,
    },
  });
}

export async function updateWorkflow(formData: FormData) {
  const parsed = validateWorkflowFormData(formData);
  if (!parsed.existingWorkflowId)
    throw new Error("No existing workflow id provided. This is a bug.");

  for (const step of parsed.steps) {
    const {
      name,
      actionMessage,
      actionSubject,
      actionTarget,
      actionType,
      id,
      proceedImmediatelyTo,
    } = step;
    await prisma.orderWorkflowStep.update({
      where: {
        id,
      },
      data: {
        name,
        actionType,
        actionTarget,
        actionSubject,
        actionMessage,
        proceedImmediatelyTo:
          proceedImmediatelyTo !== undefined ? proceedImmediatelyTo : null,
      },
    });

    for (const listener of step.proceedListeners) {
      const { from, goto, id, name, type } = listener;
      await prisma.orderWorkflowStepProceedListener.update({
        where: {
          id,
        },
        data: {
          from,
          goto,
          name,
          type,
        },
      });
    }
  }
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

export async function deleteEventListener(id: number) {
  await prisma.orderWorkflowStepProceedListener.delete({
    where: {
      id,
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

export async function deleteStep(id: number) {
  await prisma.orderWorkflowStep.delete({
    where: {
      id,
    },
  });
}

export async function updateWebstore(formData: FormData) {
  const {
    changeApiKey,
    changeApiSecret,
    id,
    name,
    orgName,
    url,
    allowApproverChangeMethod,
    allowUpsToCanada,
    shippingMethodIds,
  } = validateWebstoreFormData(formData);
  if (isNaN(+`${id}`))
    throw new Error(`Invalid webstore id ${id}. This is a bug.`);
  const changingApiKey = changeApiKey !== "";
  const changingApiSecret = changeApiSecret !== "";

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

  await prisma.webstore.update({
    where: {
      id: +`${id}`,
    },
    data: {
      name,
      organizationName: orgName,
      url,
      apiKey: changingApiKey ? apiKey : undefined,
      apiKeyEncryptIv: changingApiKey ? apiKeyEncryptIv : undefined,
      apiKeyEncryptTag: changingApiKey
        ? apiKeyEncryptTag.toString("base64")
        : undefined,
      apiSecret: changingApiSecret ? apiSecret : undefined,
      apiSecretEncryptIv: changingApiSecret ? apiSecretEncryptIv : undefined,
      apiSecretEncryptTag: changingApiSecret
        ? apiSecretEncryptTag.toString("base64")
        : undefined,
      shippingMethods: {
        set: shippingMethodIds.map((id) => ({ id })),
      },
    },
  });

  await prisma.webstoreShippingSettings.update({
    where: {
      webstoreId: +`${id}`,
    },
    data: {
      allowApproverChangeMethod,
      allowUpsToCanada,
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
    allowApproverChangeMethod,
    allowUpsToCanada,
    shippingMethodIds,
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

  await createDbWebstore(
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
    },
    allowApproverChangeMethod,
    allowUpsToCanada,
    shippingMethodIds
  );

  revalidatePath("/admin/order-approval/webstores");
  redirect("/admin/order-approval/webstores");
}

export async function setUserIsApprover(id: number, isApprover: boolean) {
  await prisma.orderWorkflowUser.update({
    where: {
      id,
    },
    data: {
      isApprover,
    },
  });
}

export async function setUserEmail(id: number, email: string) {
  await prisma.orderWorkflowUser.update({
    where: {
      id,
    },
    data: {
      email,
    },
  });
}

export async function createUserForWebstore(
  webstoreId: number,
  name: string,
  email: string
) {
  await prisma.orderWorkflowUser.create({
    data: {
      webstoreId,
      name,
      email,
    },
  });
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
