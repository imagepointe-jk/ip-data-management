import { OrderWorkflowInstance, OrderWorkflowStep } from "@prisma/client";
import {
  createWorkflowInstanceLog,
  resolveDynamicUserIdentifier,
} from "../utility";
import { processFormattedText } from "../mail/mail";
import { sendEmail } from "@/utility/mail";

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

  const processedSubject = (step.actionSubject || "Order Update").replace(
    /\{order-id\}/,
    `${workflowInstance.wooCommerceOrderId}`
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
        `Step ${step.order} of workflow instance ${workflowInstance.id} failed to send an email to ${target}`,
        "error",
        "send email"
      );
    }
  }
}
