import { OrderWorkflowInstance, OrderWorkflowStep } from "@prisma/client";
import {
  createWorkflowInstanceLog,
  resolveDynamicUserIdentifier,
} from "../utility";
import { processFormattedText } from "../mail/mail";
import { sendEmail } from "@/utility/mail";
import { decryptWebstoreData } from "../encryption";
import { OrderWorkflowEmailContext } from "@/types/schema/orderApproval";
import {
  getWorkflowInstanceWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";

export async function doEmailAction(
  step: OrderWorkflowStep,
  workflowInstance: OrderWorkflowInstance
) {
  const { allTargets, targetPrimary } = await resolveAllTargets(
    step,
    workflowInstance
  );
  const { processedMessage, processedSubject } = await prepareEmailContent({
    step,
    workflowInstance,
    targetPrimary,
  });

  await sendToTargets({
    allTargets,
    targetPrimary,
    processedMessage,
    processedSubject,
    step,
    workflowInstance,
  });
}

async function createEmailContext(
  step: OrderWorkflowStep,
  workflowInstance: OrderWorkflowInstance
): Promise<OrderWorkflowEmailContext> {
  const instance = await getWorkflowInstanceWithIncludes(workflowInstance.id);
  if (!instance) throw new Error(`Instance ${workflowInstance.id} not found.`);

  const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
  if (!workflow)
    throw new Error(`Workflow ${instance.parentWorkflowId} not found.`);
  const { key, secret } = decryptWebstoreData(workflow.webstore);
  const orderResponse = await getOrder(
    instance?.wooCommerceOrderId,
    workflow.webstore.url,
    key,
    secret
  );
  if (!orderResponse.ok)
    throw new Error(`Failed to get WooCommerce order ${workflow.id}`);
  const orderJson = await orderResponse.json();
  const parsedOrder = parseWooCommerceOrderJson(orderJson);

  return {
    order: parsedOrder,
  };
}

async function resolveAllTargets(
  step: OrderWorkflowStep,
  workflowInstance: OrderWorkflowInstance
) {
  const targetPrimary = await resolveDynamicUserIdentifier(
    step.actionTarget,
    workflowInstance
  );
  if (!targetPrimary)
    throw new Error(
      `Workflow instance ${workflowInstance.id} tried to send an email to invalid target "${step.actionTarget}"!`
    );
  const otherTargets = step.otherActionTargets
    ? step.otherActionTargets.split(";")
    : [];

  return {
    targetPrimary,
    allTargets: [targetPrimary, ...otherTargets],
  };
}

async function prepareEmailContent(params: {
  step: OrderWorkflowStep;
  workflowInstance: OrderWorkflowInstance;
  targetPrimary: string;
}) {
  const { step, workflowInstance, targetPrimary } = params;

  //this context object was created in a tight-deadline refactor and is not being fully utilized.
  //it should be used throughout the email generation process, so that we fetch the data we need exactly once and then use it as needed.
  //currently the same data is being fetched more than once.
  const context = await createEmailContext(step, workflowInstance);
  const processedSubject = (step.actionSubject || "Order Update").replace(
    /\{order-id\}/,
    `${context.order.number}`
  ); //currently the order id is the only dynamic value needed for the subject; this will need to be more robust if more are needed
  const processedMessage = await processFormattedText(
    `${step.actionMessage}`,
    workflowInstance.id,
    targetPrimary
  );

  return { processedMessage, processedSubject };
}

async function sendToTargets(params: {
  allTargets: string[];
  targetPrimary: string;
  processedSubject: string;
  processedMessage: string;
  step: OrderWorkflowStep;
  workflowInstance: OrderWorkflowInstance;
}) {
  const {
    allTargets,
    targetPrimary,
    processedMessage,
    processedSubject,
    step,
    workflowInstance,
  } = params;

  for (const target of allTargets) {
    //The message may appear to be addressed directly to targetPrimary.
    //Clarify to anyone in allTargets that they are intentionally receiving the message as well.
    const prepend =
      target === targetPrimary
        ? ""
        : `<strong>This message's primary recipient is ${targetPrimary}, but you have have been included on the email list for this order.</strong><br /><br />`;

    try {
      await sendEmail(target, processedSubject, prepend + processedMessage);
      await createWorkflowInstanceLog(
        workflowInstance.id,
        `Step ${step.order} of workflow instance ${workflowInstance.id} sent an email to ${target}`,
        "info",
        "send email"
      );
    } catch (error) {
      await createWorkflowInstanceLog(
        workflowInstance.id,
        `Step ${step.order} of workflow instance ${workflowInstance.id} failed to send an email to ${target}; ${error}`,
        "error",
        "send email"
      );
    }
  }
}
