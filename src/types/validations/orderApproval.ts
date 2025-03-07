import { NextRequest } from "next/server";
import { wooCommerceWebhookRequestSchema } from "../schema/woocommerce";
import {
  orderApprovalServerDataSchema,
  webstoreFormDataSchema,
} from "../schema/orderApproval";
import { findAllFormValues } from "@/utility/misc";

export function validateOrderApprovalServerData(data: any) {
  return orderApprovalServerDataSchema.parse(data);
}

export async function parseWooCommerceWebhookRequest(req: NextRequest) {
  const body = await req.json();
  const data = {
    headers: {
      webhookSource: req.headers.get("x-wc-webhook-source"),
      webhookEvent: req.headers.get("x-wc-webhook-event"),
      webhookResource: req.headers.get("x-wc-webhook-resource"),
    },
    body,
  };
  return wooCommerceWebhookRequestSchema.parse(data);
}

export function validateWorkflowFormData(formData: FormData) {
  const existingWorkflowId = formData.get("existingWorkflowId");
  const allStepNames = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-name/)
  );
  const allActionTypes = findAllFormValues(formData, (name) =>
    name.includes("actionType")
  );
  const allActionTargets = findAllFormValues(formData, (name) =>
    name.includes("actionTarget")
  );
  const allOtherActionTargets = findAllFormValues(formData, (name) =>
    name.includes("otherActionTargets")
  );
  const allActionSubjects = findAllFormValues(formData, (name) =>
    name.includes("actionSubject")
  );
  const allActionMessages = findAllFormValues(formData, (name) =>
    name.includes("actionMessage")
  );
  const allProceedImmediately = findAllFormValues(formData, (name) =>
    name.includes("proceedImmediately")
  );
  const allListenerNames = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-name/)
  );
  const allListenerTypes = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-type/)
  );
  const allListenerFrom = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-from/)
  );
  const allListenerGoto = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-goto/)
  );

  const stepIds = allActionTypes.map(
    (field) => +`${field.fieldName.match(/\d+/)}`
  );
  const steps = stepIds.map((id) => {
    const allListenerIdsThisStep = allListenerNames
      .filter((field) => field.fieldName.includes(`step-${id}`))
      .map(
        (field) => +`${field.fieldName.match(`(?<=step-${id}-listener-)\\d+`)}`
      );
    //handle case where form data is submitted without an "action target" value selected
    const actionTargetValue = allActionTargets.find((field) =>
      field.fieldName.includes(`${id}`)
    )?.fieldValue;
    const actionTarget = !actionTargetValue
      ? null
      : actionTargetValue.toString().includes("none")
      ? null
      : actionTargetValue.toString();

    return {
      id,
      name: allStepNames
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionType: allActionTypes
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionTarget,
      otherActionTargets: allOtherActionTargets
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionSubject: allActionSubjects
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionMessage: allActionMessages
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      proceedImmediatelyTo: allProceedImmediately
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      proceedListeners: allListenerIdsThisStep.map((listenerId) => ({
        id: listenerId,
        name: allListenerNames
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-name`)
          )
          ?.fieldValue.toString(),
        type: allListenerTypes
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-type`)
          )
          ?.fieldValue.toString(),
        from: allListenerFrom
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-from`)
          )
          ?.fieldValue.toString(),
        goto: allListenerGoto
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-goto`)
          )
          ?.fieldValue.toString(),
      })),
    };
  });

  return {
    existingWorkflowId: existingWorkflowId ? +existingWorkflowId : undefined,
    steps,
  };
}
