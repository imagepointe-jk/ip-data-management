"use server";

import { OrderWorkflowEventType } from "@/types/schema/orderApproval";
import { prisma } from "../../../prisma/client";
import {
  handleWorkflowEvent,
  startWorkflowInstanceFromBeginning,
} from "@/order-approval/main";
import {
  getAccessCodeWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { sendEmail } from "@/utility/mail";
import {
  createSupportEmail,
  processFormattedText,
} from "@/order-approval/mail/mail";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { getOrder } from "@/fetch/woocommerce";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";

export async function receiveWorkflowEvent(
  accessCode: string,
  type: OrderWorkflowEventType,
  message: string | null,
  pin?: string
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

    const requiresPin = type === "approve" || type === "deny";
    if (requiresPin && foundAccessCode.simplePin !== `${pin}`)
      throw new Error("Invalid PIN.");

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

export async function restartWorkflow(id: number) {
  await startWorkflowInstanceFromBeginning(id);
}

export async function moveWorkflowStep(
  id: number,
  direction: "earlier" | "later"
) {
  const targetStep = await prisma.orderWorkflowStep.findUnique({
    where: {
      id,
    },
  });
  if (!targetStep) throw new Error(`Step ${id} not found.`);
  const allWorkflowSteps = await prisma.orderWorkflowStep.findMany({
    where: {
      workflowId: targetStep.workflowId,
    },
  });
  const otherStep = allWorkflowSteps.find((otherStep) =>
    direction === "earlier"
      ? otherStep.order === targetStep.order - 1
      : otherStep.order === targetStep.order + 1
  );
  if (!otherStep)
    throw new Error(
      `Failed to move step ${id} ${direction} because a suitable step was not found to swap it with.`
    );

  const result = await prisma.$transaction([
    prisma.orderWorkflowStep.update({
      where: {
        id: targetStep.id,
      },
      data: {
        order: otherStep.order,
      },
    }),
    prisma.orderWorkflowStep.update({
      where: {
        id: otherStep.id,
      },
      data: {
        order: targetStep.order,
      },
    }),
  ]);

  return {
    movedStep: result[0],
    swappedStep: result[1],
  };
}

export async function receiveOrderHelpForm(formData: FormData) {
  const comments = formData.get("comments");
  const code = formData.get("code");
  if (!comments || !code)
    throw new Error(
      `An invalid order help form was submitted for access code ${
        code || "(no access code)"
      }.`
    );

  const foundCode = await getAccessCodeWithIncludes(`${code}`);
  if (!foundCode)
    throw new Error(
      `An order help form was submitted for access code ${code}, but that code was not found in the database.`
    );
  const {
    workflowInstance: {
      parentWorkflow: { webstore },
      wooCommerceOrderId,
    },
    user,
  } = foundCode;

  const webstoresEmail = process.env.IP_WEBSTORES_EMAIL;
  if (!webstoresEmail) throw new Error("Missing webstores email");

  const otherEmails = webstore.otherSupportEmails?.split(";") || [];
  const targetAddresses = [
    webstoresEmail,
    webstore.salesPersonEmail,
    ...otherEmails,
  ];
  const messageBody = await createSupportEmail(
    webstore,
    wooCommerceOrderId,
    user.name,
    user.email,
    `${comments}`
  );

  //no Promise.all because concurrent connections are throttled with our email service
  for (const address of targetAddresses) {
    try {
      await sendEmail(
        address,
        `Support request for order ${foundCode.workflowInstance.wooCommerceOrderId}`,
        messageBody
      );
    } catch (error) {
      console.error(`Error sending support request email to ${address}`, error);
    }
  }
}

export async function processFormattedTextAction(e: FormData) {
  const id = +`${e.get("id")}`;
  const email = `${e.get("email")}`;
  const text = (e.get("text") || "").toString();
  return processFormattedText(text, id, email);
}

//getting data via server action is easy, but not intended by Next.js team.
//keep an eye on this in case it breaks in the future.
export async function getFullWorkflow(id: number) {
  return getWorkflowWithIncludes(id);
}

export async function sendInvoiceEmail(
  workflowInstanceId: number,
  recipientAddress: string
) {
  const instance = await prisma.orderWorkflowInstance.findUnique({
    where: {
      id: workflowInstanceId,
    },
    include: {
      parentWorkflow: {
        include: {
          webstore: true,
        },
      },
    },
  });
  if (!instance)
    throw new Error(`Workflow instance ${workflowInstanceId} not found.`);

  const { wooCommerceOrderId, parentWorkflow } = instance;
  const { key, secret } = decryptWebstoreData(parentWorkflow.webstore);
  const orderResponse = await getOrder(
    wooCommerceOrderId,
    parentWorkflow.webstore.url,
    key,
    secret
  );
  if (!orderResponse.ok)
    throw new Error(`Failed to get WooCommerce order ${wooCommerceOrderId}`);
  const orderJson = await orderResponse.json();
  const parsedOrder = parseWooCommerceOrderJson(orderJson);

  const templateSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/order-approval/mail/invoiceEmail.hbs"),
    "utf-8"
  );
  const template = handlebars.compile(templateSource);
  const message = template(parsedOrder);

  return sendEmail(
    recipientAddress,
    `Invoice for Order ${wooCommerceOrderId}`,
    message
  );
}
