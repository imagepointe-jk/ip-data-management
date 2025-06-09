import { handleRequestError } from "@/app/api/handleError";
import { env } from "@/env";
import { AppError } from "@/error";
import { getProduct } from "@/fetch/woocommerce";
import { NOT_FOUND } from "@/utility/statusCodes";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = +params.id;
    if (isNaN(id))
      throw new AppError({
        type: "Client Request",
        clientMessage: "ID must be a number.",
        statusCode: NOT_FOUND,
      });
    const response = await getProduct(
      id,
      env.IP_WOOCOMMERCE_STORE_URL,
      env.IP_WP_APPLICATION_USERNAME,
      env.IP_WP_APPLICATION_PASSWORD
    );
    if (!response.ok)
      throw new AppError({
        type: "Unknown",
        clientMessage: "Request failed",
        statusCode: response.status,
      });
    const json = await response.json();
    return Response.json(json);
  } catch (error) {
    return handleRequestError(error);
  }
}
