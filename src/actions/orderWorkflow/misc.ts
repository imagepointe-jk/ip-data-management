"use server";

import { OrderWorkflowEventType } from "@/types/schema/orderApproval";
import { prisma } from "../../../prisma/client";
import { handleWorkflowEvent } from "@/order-approval/main";
import {
  getAccessCodeWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { createHandlebarsEmailBody, sendEmail } from "@/utility/mail";
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
import {
  startOrderWorkflow,
  startWorkflowInstanceFromBeginning,
} from "@/order-approval/start";
import { getDaysSinceDate } from "@/utility/misc";
import { createLog } from "./create";
import { env } from "@/env";

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
    if (!foundAccessCode) throw new Error("Access code not found.");

    const requiresPin =
      foundAccessCode.workflowInstance.parentWorkflow.webstore
        .requirePinForApproval &&
      (type === "approve" || type === "deny");
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

export async function receiveOrderHelpForm(data: {
  comments: string;
  code: string;
}) {
  // const comments = formData.get("comments");
  // const code = formData.get("code");
  const { code, comments } = data;
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

  const webstoresEmail = env.IP_WEBSTORES_EMAIL;
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
      approvedByUser: {
        include: {
          accessCodes: true,
        },
      },
    },
  });
  if (!instance)
    throw new Error(`Workflow instance ${workflowInstanceId} not found.`);

  const approvedByUserName = instance.approvedByUser?.name || "USER_NOT_FOUND";
  const approvedByPin =
    instance.approvedByUser?.accessCodes.find(
      (code) => code.instanceId === workflowInstanceId
    )?.simplePin || "PIN_NOT_FOUND";

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
  const message = template({
    ...parsedOrder,
    approvedByUserName,
    approvedByPin,
  });

  return sendEmail(
    recipientAddress,
    `Invoice for Order ${wooCommerceOrderId}`,
    message
  );
}

export async function sendReminderEmails() {
  const twentyFourHours = 1000 * 60 * 60 * 24;
  const now = Date.now();
  const oneDayAgo = now - twentyFourHours;
  const workflowsWithOldInstances = await prisma.orderWorkflow.findMany({
    where: {
      instances: {
        some: {
          AND: [
            {
              createdAt: {
                lte: new Date(oneDayAgo),
              },
            },
            {
              status: {
                not: "finished",
              },
            },
          ],
        },
      },
    },
    include: {
      instances: {
        where: {
          AND: [
            {
              createdAt: {
                lte: new Date(oneDayAgo),
              },
            },
            {
              status: {
                not: "finished",
              },
            },
          ],
        },
      },
      webstore: true,
    },
  });

  for (const workflow of workflowsWithOldInstances) {
    if (!workflow.webstore.sendReminderEmails) continue;

    const oldInstances = workflow.instances.map((instance) => ({
      id: instance.wooCommerceOrderId,
      createdAt: instance.createdAt.toLocaleDateString(),
      daysAgo: Math.floor(getDaysSinceDate(instance.createdAt)),
    }));
    const message = createHandlebarsEmailBody(
      "src/order-approval/mail/outstandingInstances.hbs",
      {
        webstoreName: workflow.webstore.name,
        webstoreUrl: workflow.webstore.url,
        instances: oldInstances,
      }
    );
    const emails = workflow.webstore.reminderEmailTargets
      ? workflow.webstore.reminderEmailTargets.split(";")
      : [];
    for (const email of emails) {
      try {
        await sendEmail(email, "Outstanding Orders", message);
        await createLog(
          workflow.webstore.id,
          `Sent reminder email to ${email} for ${oldInstances.length} outstanding orders.`,
          "info",
          "send email"
        );
      } catch (error) {
        await createLog(
          workflow.webstore.id,
          `Failed to send a reminder email to ${email}`,
          "error",
          "send email"
        );
      }
    }
  }
}

export async function startOrderWorkflowAction(
  orderId: number,
  webstoreUrl: string
) {
  return startOrderWorkflow({
    email: "n/a",
    firstName: "n/a",
    lastName: "n/a", //these parameters are currently unused
    orderId,
    webhookSource: webstoreUrl,
  });
}
