import { easyCorsInit } from "@/constants";
import { AppError } from "@/error";
import { validateQuoteRequest } from "@/types/validations/designs";
import { sendQuoteRequestEmail } from "@/utility/mail";
import { message } from "@/utility/misc";
import {
  INTERNAL_SERVER_ERROR,
  NOT_AUTHENTICATED,
} from "@/utility/statusCodes";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = new Headers({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

export async function POST(request: NextRequest) {
  try {
    const password = process.env.QUOTE_REQUEST_AUTH_PASSWORD;
    if (!password)
      throw new AppError({
        type: "Environment",
        clientMessage: "Server error.",
        serverMessage: "No quote request auth password!",
        statusCode: INTERNAL_SERVER_ERROR,
      });

    const authorization = request.headers.get("Authorization");
    const split = authorization?.split(" ");
    if (!split || split[1] !== password)
      throw new AppError({
        type: "Authentication",
        clientMessage: "Bad credentials.",
        serverMessage: "Invalid credentials received for POST quote request.",
        statusCode: NOT_AUTHENTICATED,
      });

    const data = await request.json();
    const parsed = validateQuoteRequest(data);
    await sendQuoteRequestEmail(parsed);
  } catch (error) {
    if (error instanceof AppError) {
      error.serverPrint();
      return NextResponse.json(message(error.clientMessage), {
        headers: corsHeaders,
        status: error.statusCode,
      });
    } else {
      return NextResponse.json(message("Unknown error."), {
        headers: corsHeaders,
        status: INTERNAL_SERVER_ERROR,
      });
    }
  }

  return new NextResponse(null, { headers: corsHeaders, status: 200 });
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders, status: 204 });
}
