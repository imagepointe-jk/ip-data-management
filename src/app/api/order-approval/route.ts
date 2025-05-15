import { easyCorsInit } from "@/constants";
import { getAccessCodeWithIncludes } from "@/db/access/orderApproval";
import { AppError } from "@/error";
import { NOT_AUTHENTICATED } from "@/utility/statusCodes";
import { NextRequest } from "next/server";
import { handleRequestError } from "../handleError";

export async function GET(request: NextRequest) {
  try {
    const search = new URLSearchParams(request.nextUrl.search);
    const code = search.get("code");
    if (!code)
      throw new AppError({
        type: "Client Request",
        clientMessage: "Invalid access code.",
        statusCode: NOT_AUTHENTICATED,
      });

    const foundAccessCode = await getAccessCodeWithIncludes(code);
    if (!foundAccessCode) throw new Error(`Access code ${code} not found.`);

    return Response.json(
      {
        orderId: foundAccessCode.workflowInstance.wooCommerceOrderId,
        storeUrl: foundAccessCode.workflowInstance.parentWorkflow.webstore.url,
        shippingMethods:
          foundAccessCode.workflowInstance.parentWorkflow.webstore
            .shippingMethods,
        allowApproverChangeMethod:
          foundAccessCode.workflowInstance.parentWorkflow.webstore
            .shippingSettings?.allowApproverChangeMethod,
        allowUpsToCanada:
          foundAccessCode.workflowInstance.parentWorkflow.webstore
            .shippingSettings?.allowUpsToCanada,
        userEmail: foundAccessCode.user.email,
        checkoutFields:
          foundAccessCode.workflowInstance.parentWorkflow.webstore
            .checkoutFields,
        approvedByUserName:
          foundAccessCode.workflowInstance.approvedByUser?.name,
        deniedByUserName: foundAccessCode.workflowInstance.deniedByUser?.name,
        instanceStatus: foundAccessCode.workflowInstance.status,
        requirePinForApproval:
          foundAccessCode.workflowInstance.parentWorkflow.webstore
            .requirePinForApproval,
      },
      easyCorsInit
    );
  } catch (error) {
    return handleRequestError(error);
  }
}
