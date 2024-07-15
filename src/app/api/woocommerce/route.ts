import { easyCorsInit } from "@/constants";
import { startOrderWorkflow } from "@/order-approval/main";
import { parseWooCommerceWebhookRequest } from "@/types/validations";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      body: {
        billing: { email, first_name, last_name },
        id,
      },
      headers: { webhookEvent, webhookResource, webhookSource },
    } = await parseWooCommerceWebhookRequest(request);
    console.log("RECEIVED WEBHOOK FROM ", webhookSource);

    if (webhookResource === "order" && webhookEvent === "created") {
      startOrderWorkflow({
        email,
        firstName: first_name,
        lastName: last_name,
        orderId: id,
        webhookSource,
      });
    } else {
      throw new Error(
        `No behavior is implemented for the webhook event "${webhookResource} ${webhookEvent}"`
      );
    }
  } catch (error) {
    console.error(error);
  }
  return Response.json({}, easyCorsInit);
}
