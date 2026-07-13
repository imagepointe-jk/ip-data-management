import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";
import { inspect } from "util";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const variations = json.variation_details;
    if (!Array.isArray(variations)) throw new Error();
    console.log("FOUND VARIATIONS");
    console.log(inspect(variations, true, null));
  } catch (error) {
    console.log("Unable to parse json");
  }

  try {
    const text = await request.text();
    console.log(text);
  } catch (error) {
    console.log("unable to parse text");
  }

  //Always send a 200 response back to WooCommerce; the webhook seems to break otherwise
  return Response.json({}, easyCorsInit);
}
