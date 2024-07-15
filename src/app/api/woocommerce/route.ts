import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const webhookSource = request.headers.get("x-wc-webhook-source");
    if (!webhookSource)
      throw new Error(
        "A request reached the WooCommerce webhook endpoint with no source specified."
      );

    console.log("RECEIVED REQUEST FROM ", webhookSource);
  } catch (error) {
    console.error(error);
  }
  return Response.json({}, easyCorsInit);
}
