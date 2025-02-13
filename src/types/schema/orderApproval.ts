import { z } from "zod";

export const orderWorkflowUserRoles = ["approver", "purchaser"] as const;
const orderWorkflowUserRoleSchema = z.enum(orderWorkflowUserRoles);
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
  userEmail: z.string(), //the email of the user associated with the provided access code
});

export type OrderWorkflowUserRole = z.infer<typeof orderWorkflowUserRoleSchema>;
export type OrderWorkflowActionType = z.infer<
  typeof orderWorkflowActionTypeSchema
>;
export type OrderWorkflowEventType = z.infer<
  typeof orderWorkflowEventTypeSchema
>;
export type OrderApprovalServerData = z.infer<
  typeof orderApprovalServerDataSchema
>;
