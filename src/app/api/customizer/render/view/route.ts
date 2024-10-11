import { easyCorsInit } from "@/constants";
import { renderCartProductView } from "@/customizer/render";
import {
  validateCartStateProductVariation,
  validateCartStateProductView,
} from "@/types/validations/customizer";
import archiver from "archiver";
import { NextRequest, NextResponse } from "next/server";
import { Writable } from "stream";
import { prisma } from "../../../../../../prisma/client";
import { message } from "@/utility/misc";
import { INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";

//render a single view of a product design and send the image file back
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateCartStateProductView(body.view);
    const bgImgUrl = `${body.bgImgUrl}`;

    const rendered = await renderCartProductView(parsed, bgImgUrl);

    return new NextResponse(rendered, {
      ...easyCorsInit,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": "attachment; filename='my-product-view.jpg'",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json(message("Unknown error."), {
      status: INTERNAL_SERVER_ERROR,
    });
  }
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { ...easyCorsInit, status: 204 });
}
