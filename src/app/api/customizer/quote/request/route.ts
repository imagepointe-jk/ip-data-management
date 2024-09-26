import { createQuoteRequest } from "@/actions/customizer/create";
import { handleRequestError } from "@/app/api/handleError";
import { easyCorsInit } from "@/constants";
import { validateQuoteRequest } from "@/types/validations/customizer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart, company, email, firstName, lastName, comments, local } =
      validateQuoteRequest(body);
    const created = await createQuoteRequest({
      firstName,
      lastName,
      email,
      company,
      local: local || null,
      comments: comments || null,
      cartJson: JSON.stringify(cart),
    });

    return Response.json(created, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { ...easyCorsInit, status: 204 });
}
