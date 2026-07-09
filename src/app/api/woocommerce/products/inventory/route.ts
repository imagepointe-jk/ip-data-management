import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";
import { inspect } from "util";

export async function POST(request: NextRequest) {
  const json = await request.json();
  console.log(inspect(json, true, null));
  //Always send a 200 response back to WooCommerce; the webhook seems to break otherwise
  return Response.json({}, easyCorsInit);
}
