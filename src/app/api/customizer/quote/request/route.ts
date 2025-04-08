import { createQuoteRequest } from "@/actions/customizer/create";
import { updateQuoteRequest } from "@/actions/customizer/update";
import { handleRequestError } from "@/app/api/handleError";
import { easyCorsInit } from "@/constants";
import { uploadQuoteRequestRender } from "@/customizer/utils/server";
import { validateQuoteRequest } from "@/types/validations/customizer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const quoteRequest = validateQuoteRequest(body);
    const { cart, company, email, firstName, lastName, comments, local } =
      quoteRequest;

    //first create the quote request in the database using empty cart data
    //this gives us a record id to include in the image files we upload
    const createdQuoteRequest = await createQuoteRequest({
      firstName,
      lastName,
      email,
      company,
      local: local || null,
      comments: comments || null,
      cartJson: "no cart data yet",
    });

    //loop through each view and upload their renders, replacing the dataURLs with the uploaded URLs as we go
    //this avoids storing the base64 renders in the db
    for (const product of cart.products) {
      for (const variation of product.variations) {
        for (const view of variation.views) {
          const viewRenderResponse = await fetch(view.currentRenderUrl);
          const blob = await viewRenderResponse.blob();
          const generatedName = `${quoteRequest.firstName}-${quoteRequest.lastName}-customizer-request-${createdQuoteRequest.id}-viewId-${view.id}`;
          const file = new File([blob], `${generatedName}.jpg`, {
            type: "image/jpeg",
          });
          const { uploadedUrl } = await uploadQuoteRequestRender(file);
          view.currentRenderUrl = uploadedUrl;
        }
      }
    }

    //we've uploaded all the view renders now, and overwritten the dataURLs that were in the cart, so update the quote request with the updated cart
    const updated = await updateQuoteRequest({
      ...createdQuoteRequest,
      cartJson: JSON.stringify(cart),
    });

    return Response.json(updated, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { ...easyCorsInit, status: 204 });
}
