"use server";

import { validateWebstoreFormData } from "@/types/validations/orderApproval";
import { prisma } from "../../../prisma/client";
import { encrypt } from "@/utility/misc";
import { OrderUpdateData, updateOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { handleOrderUpdated } from "@/order-approval/main";
import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/schema/misc";

export async function updateWorkflow(
  data: Exclude<UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>, null>
) {
  const proceedListeners = data.steps
    .map((step) => step.proceedListeners)
    .flat();

  await prisma.$transaction([
    prisma.orderWorkflow.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
      },
    }),
    ...data.steps.map((step) =>
      prisma.orderWorkflowStep.update({
        where: {
          id: step.id,
        },
        data: {
          name: step.name,
          order: step.order,
          actionType: step.actionType,
          actionTarget: step.actionTarget,
          otherActionTargets: step.otherActionTargets,
          actionSubject: step.actionSubject,
          actionMessage: step.actionMessage,
          proceedImmediatelyTo: step.proceedImmediatelyTo,
        },
      })
    ),
    ...proceedListeners.map((listener) =>
      prisma.orderWorkflowStepProceedListener.update({
        where: {
          id: listener.id,
        },
        data: listener,
      })
    ),
  ]);
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
