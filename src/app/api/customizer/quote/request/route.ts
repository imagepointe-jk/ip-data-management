import { createQuoteRequest } from "@/actions/customizer/create";
import { handleRequestError } from "@/app/api/handleError";
import { populateProductData } from "@/app/customizer/handleData";
import { easyCorsInit } from "@/constants";
import { sendQuoteRequestEmail } from "@/customizer/mail/mail";
import { getProductSettingsWithIncludes } from "@/db/access/customizer";
import { validateQuoteRequest } from "@/types/validations/customizer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const quoteRequest = validateQuoteRequest(body);
    const { cart, company, email, firstName, lastName, comments, local } =
      quoteRequest;
    const created = await createQuoteRequest({
      firstName,
      lastName,
      email,
      company,
      local: local || null,
      comments: comments || null,
      cartJson: JSON.stringify(cart),
    });

    const settings = await getProductSettingsWithIncludes();
    const populated = await populateProductData(settings);

    sendQuoteRequestEmail(quoteRequest, created.id);

    return Response.json(created, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { ...easyCorsInit, status: 204 });
}
