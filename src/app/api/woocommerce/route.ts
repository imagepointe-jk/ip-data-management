import { easyCorsInit } from "@/constants";
import { parseWooCommerceWebhookRequest } from "@/types/validations";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const parsed = parseWooCommerceWebhookRequest(request);
    console.log(JSON.stringify(parsed));
  } catch (error) {
    console.error(error);
  }
  return Response.json({}, easyCorsInit);
}
