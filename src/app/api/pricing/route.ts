import { easyCorsInit } from "@/constants";
import { calculatePrice } from "@/pricing/calc";
import { validatePricingRequest } from "@/types/validations";
import { message } from "@/utility/misc";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validatePricingRequest(body);
    const results = calculatePrice(parsed);
    return Response.json({ results }, easyCorsInit);
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return Response.json(error, { status: BAD_REQUEST });
    } else {
      return Response.json(message("Unknown error."), {
        status: INTERNAL_SERVER_ERROR,
      });
    }
  }
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { ...easyCorsInit, status: 204 });
}
