"use server";

import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import {
  addMetaDataToOrder,
  OrderUpdateData,
  updateOrder,
} from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { handleOrderUpdated } from "@/order-approval/main";
import { UnwrapPromise } from "@/types/schema/misc";
import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { encrypt } from "@/utility/misc";
import { prisma } from "../../../prisma/client";

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

export async function updateWebstore(
  data: WebstoreEditorData & { changeApiKey?: string; changeApiSecret?: string }
) {
  const {
    id,
    name,
    organizationName,
    url,
    salesPersonEmail,
    salesPersonName,
    otherSupportEmails,
    orderUpdatedEmails,
    shippingEmailFilename,
    checkoutFields,
    shippingMethods,
    shippingSettings,
    changeApiKey,
    changeApiSecret,
    approverDashboardViewerEmail,
    requirePinForApproval,
    allowOrderHelpRequest,
  } = data;

  const {
    ciphertext: apiKey,
    iv: apiKeyEncryptIv,
    tag: apiKeyEncryptTag,
  } = encrypt(changeApiKey || "");
  const {
    ciphertext: apiSecret,
    iv: apiSecretEncryptIv,
    tag: apiSecretEncryptTag,
  } = encrypt(changeApiSecret || "");

  await prisma.$transaction([
    prisma.webstore.update({
      where: {
        id,
      },
      data: {
        name,
        organizationName,
        url,
        salesPersonEmail,
        salesPersonName,
        otherSupportEmails,
        orderUpdatedEmails,
        shippingEmailFilename,
        apiKey: changeApiKey ? apiKey : undefined,
        apiKeyEncryptIv: changeApiKey ? apiKeyEncryptIv : undefined,
        apiKeyEncryptTag: changeApiKey
          ? apiKeyEncryptTag.toString("base64")
          : undefined,
        apiSecret: changeApiSecret ? apiSecret : undefined,
        apiSecretEncryptIv: changeApiSecret ? apiSecretEncryptIv : undefined,
        apiSecretEncryptTag: changeApiSecret
          ? apiSecretEncryptTag.toString("base64")
          : undefined,
        shippingMethods: {
          set: shippingMethods.map((method) => ({ id: method.id })),
        },
        approverDashboardViewerEmail,
        requirePinForApproval,
        allowOrderHelpRequest,
      },
    }),
    prisma.webstoreShippingSettings.update({
      where: {
        webstoreId: id,
      },
      data: {
        allowApproverChangeMethod:
          shippingSettings?.allowApproverChangeMethod || false,
        allowUpsToCanada: shippingSettings?.allowUpsToCanada || false,
      },
    }),
    ...checkoutFields.map((field) =>
      prisma.webstoreCheckoutField.update({
        where: {
          id: field.id,
        },
        data: {
          name: field.name,
          label: field.label,
          type: field.type,
          options: field.options,
          userCanEdit: field.userCanEdit,
        },
      })
    ),
  ]);
}

// export async function setUserIsApprover(
//   userId: number,
//   webstoreId: number,
//   isApprover: boolean
// ) {
//   await prisma.orderWorkflowWebstoreUserRole.update({
//     where: {
//       userId_webstoreId: {
//         userId,
//         webstoreId,
//       },
//     },
//     data: {
//       role: isApprover ? "approver" : "purchaser",
//     },
//   });
// }

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
  metaDataToAdd: { key: string; value: string }[],
  userEmail: string //the email of the user initiating the update action
) {
  const webstore = await prisma.webstore.findUnique({
    where: {
      url: storeUrl,
    },
  });
  if (!webstore) throw new Error(`Webstore with url ${storeUrl} not found.`);

  const { key, secret } = decryptWebstoreData(webstore);

  if (metaDataToAdd.length > 0) {
    const addMetaDataResponse = await addMetaDataToOrder(
      updateData.id,
      storeUrl,
      key,
      secret,
      metaDataToAdd
    );
    if (!addMetaDataResponse.ok)
      throw new Error(
        `API response code ${addMetaDataResponse.status} when trying to add metadata to order ${updateData.id} for store ${storeUrl}`
      );
  }

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

export async function updateRole(id: number, name: string) {
  return prisma.webstoreUserRole.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
}

export async function removeRoleFromUser(userId: number, roleId: number) {
  return prisma.webstoreUserRole.update({
    where: {
      id: roleId,
    },
    data: {
      users: {
        disconnect: [{ id: userId }],
      },
    },
  });
}

export async function addRoleToUser(userId: number, roleId: number) {
  return prisma.webstoreUserRole.update({
    where: {
      id: roleId,
    },
    data: {
      users: {
        connect: [{ id: userId }],
      },
    },
  });
}
