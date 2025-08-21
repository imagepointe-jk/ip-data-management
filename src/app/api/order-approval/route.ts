import { easyCorsInit } from "@/constants";
import { AppError } from "@/error";
import { NOT_AUTHENTICATED } from "@/utility/statusCodes";
import { NextRequest } from "next/server";
import { handleRequestError } from "../handleError";
import { prisma } from "../../../../prisma/client";
import {
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import { resolveDynamicUserIdentifier } from "@/order-approval/utility";
import { deduplicateArray } from "@/utility/misc";

// export async function GET(request: NextRequest) {
//   try {
//     const search = new URLSearchParams(request.nextUrl.search);
//     const code = search.get("code");
//     if (!code)
//       throw new AppError({
//         type: "Client Request",
//         clientMessage: "Invalid access code.",
//         statusCode: NOT_AUTHENTICATED,
//       });

//     const foundAccessCode = await prisma.orderWorkflowAccessCode.findFirst({
//       where: {
//         guid: code,
//       },
//       include: {
//         workflowInstance: {
//           include: {
//             parentWorkflow: {
//               include: {
//                 webstore: {
//                   include: {
//                     shippingMethods: true,
//                     shippingSettings: true,
//                     checkoutFields: true,
//                   },
//                 },
//                 steps: {
//                   include: {
//                     proceedListeners: true,
//                   },
//                 },
//               },
//             },
//             approvedByUser: true,
//             deniedByUser: true,
//           },
//         },
//         user: true,
//       },
//     });
//     if (!foundAccessCode) throw new Error(`Access code ${code} not found.`);

//     const currentStep =
//       foundAccessCode.workflowInstance.parentWorkflow.steps.find(
//         (step) => step.order === foundAccessCode.workflowInstance.currentStep
//       );
//     if (!currentStep)
//       throw new Error(
//         `Current step of workflow ${foundAccessCode.workflowInstance.parentWorkflowId} not found.`
//       );

//     const waitingOnUserEmails = await resolveWaitingOnUserEmails(
//       foundAccessCode.workflowInstance,
//       currentStep
//     );

//     return Response.json(
//       {
//         orderId: foundAccessCode.workflowInstance.wooCommerceOrderId,
//         storeUrl: foundAccessCode.workflowInstance.parentWorkflow.webstore.url,
//         shippingMethods:
//           foundAccessCode.workflowInstance.parentWorkflow.webstore
//             .shippingMethods,
//         allowApproverChangeMethod:
//           foundAccessCode.workflowInstance.parentWorkflow.webstore
//             .shippingSettings?.allowApproverChangeMethod,
//         allowUpsToCanada:
//           foundAccessCode.workflowInstance.parentWorkflow.webstore
//             .shippingSettings?.allowUpsToCanada,
//         userEmail: foundAccessCode.user.email,
//         checkoutFields:
//           foundAccessCode.workflowInstance.parentWorkflow.webstore
//             .checkoutFields,
//         approvedByUserName:
//           foundAccessCode.workflowInstance.approvedByUser?.name,
//         deniedByUserName: foundAccessCode.workflowInstance.deniedByUser?.name,
//         instanceStatus: foundAccessCode.workflowInstance.status,
//         waitingOnUserEmails,
//         requirePinForApproval:
//           foundAccessCode.workflowInstance.parentWorkflow.webstore
//             .requirePinForApproval,
//         allowOrderHelpRequest:
//           foundAccessCode.workflowInstance.parentWorkflow.webstore
//             .allowOrderHelpRequest,
//       },
//       easyCorsInit
//     );
//   } catch (error) {
//     return handleRequestError(error);
//   }
// }

// async function resolveWaitingOnUserEmails(
//   instance: OrderWorkflowInstance,
//   step: OrderWorkflowStep & {
//     proceedListeners: OrderWorkflowStepProceedListener[];
//   }
// ) {
//   const allFromValues = step.proceedListeners.map((listener) => listener.from);
//   const deduplicated = deduplicateArray(allFromValues, (val) => val);
//   const emails: string[] = [];
//   for (const from of deduplicated) {
//     const resolved =
//       (await resolveDynamicUserIdentifier(from, instance)) || "EMAIL_NOT_FOUND";
//     emails.push(resolved);
//   }
//   return emails;
// }
