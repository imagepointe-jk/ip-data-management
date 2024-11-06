import { easyCorsInit } from "@/constants";
import { getAccessCodeWithIncludes } from "@/db/access/orderApproval";
import { AppError } from "@/error";
import { NOT_AUTHENTICATED, NOT_FOUND } from "@/utility/statusCodes";
import { NextRequest } from "next/server";
import { handleRequestError } from "../../handleError";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";

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

    const data = await getAccessCodeWithIncludes(code);
    if (!data)
      throw new AppError({
        type: "Client Request",
        clientMessage: "Order not found.",
        statusCode: NOT_FOUND,
      });

    const orderId = data.workflowInstance.wooCommerceOrderId;
    const storeUrl = data.workflowInstance.parentWorkflow.webstore.url;
    const { key, secret } = decryptWebstoreData(
      data.workflowInstance.parentWorkflow.webstore
    );

    const orderResponse = await getOrder(orderId, storeUrl, key, secret);
    const orderJson = await orderResponse.json();

    return Response.json(orderJson, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}
