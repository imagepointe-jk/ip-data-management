import { z } from "zod";
import { UnwrapPromise } from "./misc";
import {
  getWebstoreWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { WebstoreCheckoutField } from "@prisma/client";

// export const orderWorkflowUserRoles = ["approver", "purchaser"] as const;
// const orderWorkflowUserRoleSchema = z.enum(orderWorkflowUserRoles);
export const orderWorkflowActionTypes = [
  "email",
  "mark workflow approved",
  "mark workflow denied",
  "cancel woocommerce order",
] as const;
const orderWorkflowActionTypeSchema = z.enum(orderWorkflowActionTypes);
export const orderWorkflowEventTypes = ["approve", "deny", "proceed"] as const;
const orderWorkflowEventTypeSchema = z.enum(orderWorkflowEventTypes);

export const webstoreFormDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  orgName: z.string(),
  url: z.string(),
  salesPersonName: z.string(),
  salesPersonEmail: z.string(),
  otherSupportEmails: z.string(),
  orderUpdatedEmails: z.string(),
  changeApiKey: z.string(),
  changeApiSecret: z.string(),
  shippingMethodIds: z.array(z.number()),
  allowApproverChangeMethod: z.boolean(),
  allowUpsToCanada: z.boolean(),
  customOrderApprovedEmail: z.string().nullable(),
  useCustomOrderApprovedEmail: z.boolean(),
});

export const orderApprovalServerDataSchema = z.object({
  orderId: z.number(),
  storeUrl: z.string(),
  shippingMethods: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      serviceCode: z.number().nullable(),
    })
  ),
  allowApproverChangeMethod: z.boolean().optional(),
  allowUpsToCanada: z.boolean().optional(),
  deniedByUserName: z.string().optional(),
  approvedByUserName: z.string().optional(),
  instanceStatus: z.string(),
  waitingOnUserEmails: z.array(z.string()),
  requirePinForApproval: z.boolean(),
  allowOrderHelpRequest: z.boolean(),
  userEmail: z.string(), //the email of the user associated with the provided access code
  checkoutFields: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      label: z.string(),
      type: z.string(),
      options: z.string().nullable(),
      userCanEdit: z.boolean(),
      order: z.number(),
      style: z.string().nullable(),
    })
  ),
});

const webstoreLogSeverities = ["info", "warning", "error"] as const;
const webstoreLogSeverity = z.enum(webstoreLogSeverities);
const webstoreLogEvents = [
  "start workflow instance",
  "approve workflow instance",
  "deny workflow instance",
  "send email",
] as const;
const webstoreLogEvent = z.enum(webstoreLogEvents);

// export type OrderWorkflowUserRole = z.infer<typeof orderWorkflowUserRoleSchema>;
export type OrderWorkflowActionType = z.infer<
  typeof orderWorkflowActionTypeSchema
>;
export type OrderWorkflowEventType = z.infer<
  typeof orderWorkflowEventTypeSchema
>;
export type OrderApprovalServerData = z.infer<
  typeof orderApprovalServerDataSchema
>;
export type OrderWorkflowWithIncludes = Exclude<
  UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
  null
>;
export type WebstoreEditorData = {
  id: number;
  name: string;
  organizationName: string;
  url: string;
  salesPersonName: string;
  salesPersonEmail: string;
  otherSupportEmails: string | null;
  orderUpdatedEmails: string | null;
  reminderEmailTargets: string | null;
  sendReminderEmails: boolean;
  shippingEmailFilename: string;
  checkoutFields: WebstoreCheckoutField[];
  shippingSettings: {
    allowApproverChangeMethod: boolean;
    allowUpsToCanada: boolean;
  } | null;
  shippingMethods: {
    id: number;
  }[];
  approverDashboardViewerEmail: string;
  requirePinForApproval: boolean;
  allowOrderHelpRequest: boolean;
  shippingEmailDestOverride: string | null;
};
export type WebstoreLogSeverity = z.infer<typeof webstoreLogSeverity>;
export type WebstoreLogEvent = z.infer<typeof webstoreLogEvent>;
