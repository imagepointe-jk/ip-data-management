"use server";

import { validateWebstoreFormData } from "@/types/validations/orderApproval";
import { prisma } from "../../../prisma/client";
import { encrypt } from "@/utility/misc";
import { createWebstore as createDbWebstore } from "@/db/access/orderApproval";

export async function createWorkflow(webstoreId: number, name: string) {
  await prisma.orderWorkflow.create({
    data: {
      name,
      webstoreId,
    },
  });
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
