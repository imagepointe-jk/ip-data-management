import { AppError } from "@/error";
import { NextRequest } from "next/server";
import { getProduct } from "@/fetch/woocommerce";
import { easyCorsInit } from "@/constants";
import { getAccessCodeWithIncludes } from "@/db/access/orderApproval";
import { NOT_FOUND } from "@/utility/statusCodes";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { handleRequestError } from "@/app/api/handleError";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = +params.id;
    if (isNaN(id))
      throw new AppError({
        type: "Client Request",
        clientMessage: "ID must be a number.",
      });

    const search = new URLSearchParams(request.nextUrl.search);
    const code = search.get("code");
    const foundCode = await getAccessCodeWithIncludes(`${code}`);
    if (!foundCode)
      throw new AppError({
        type: "Client Request",
        clientMessage: "Access code not found.",
        statusCode: NOT_FOUND,
      });

    const {
      workflowInstance: {
        parentWorkflow: { webstore },
      },
    } = foundCode;
    const { key, secret } = decryptWebstoreData(webstore);

    const productResponse = await getProduct(id, webstore.url, key, secret);
    if (!productResponse.ok)
      throw new AppError({
        type: "Unknown",
        clientMessage: "There was an error contacting WooCommerce.",
        serverMessage: `WooCommerce response status ${productResponse.status}`,
        statusCode: productResponse.status,
      });
    const productJson = await productResponse.json();

    return Response.json(productJson, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}
