"use server";

import {
  validateWebstoreFormData,
  validateWorkflowFormData,
} from "@/types/validations/orderApproval";
import { prisma } from "../../../prisma/client";
import { encrypt } from "@/utility/misc";
import { OrderUpdateData, updateOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { handleOrderUpdated } from "@/order-approval/main";

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
      otherActionTargets,
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
        otherActionTargets,
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
    orderUpdatedEmails,
    otherSupportEmails,
    salesPersonEmail,
    salesPersonName,
    customOrderApprovedEmail,
    useCustomOrderApprovedEmail,
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
      orderUpdatedEmails,
      otherSupportEmails,
      salesPersonEmail,
      salesPersonName,
      customOrderApprovedEmail,
      useCustomOrderApprovedEmail,
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

export async function setUserIsApprover(
  userId: number,
  webstoreId: number,
  isApprover: boolean
) {
  await prisma.orderWorkflowWebstoreUserRole.update({
    where: {
      userId_webstoreId: {
        userId,
        webstoreId,
      },
    },
    data: {
      role: isApprover ? "approver" : "purchaser",
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

export async function updateOrderAction(
  storeUrl: string,
  updateData: OrderUpdateData,
  userEmail: string //the email of the user initiating the update action
) {
  const webstore = await prisma.webstore.findUnique({
    where: {
      url: storeUrl,
    },
  });
  if (!webstore) throw new Error(`Webstore with url ${storeUrl} not found.`);

  const { key, secret } = decryptWebstoreData(webstore);
  const updateResponse = await updateOrder(storeUrl, key, secret, updateData);
  if (!updateResponse.ok)
    throw new Error(
      `API response code ${updateResponse.status} when trying to update order ${updateData.id} for store ${storeUrl}`
    );
  const updateJson = await updateResponse.json();
  const parsed = parseWooCommerceOrderJson(updateJson);
  handleOrderUpdated(parsed, storeUrl, userEmail);

  return parsed;
}
