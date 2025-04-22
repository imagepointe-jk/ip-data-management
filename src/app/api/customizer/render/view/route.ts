import { easyCorsInit } from "@/constants";
// import { renderCartProductView } from "@/customizer/render";
import { validateCartStateProductView } from "@/types/validations/customizer";
import { message } from "@/utility/misc";
import { INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";
import { NextRequest, NextResponse } from "next/server";

//render a single view of a product design and send the image file back
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateCartStateProductView(body.view);
    const bgImgUrl = `${body.bgImgUrl}`;
    const renderScale = !isNaN(+body.renderScale)
      ? +body.renderScale
      : undefined;

    return Response.json({ message: "old server rendering route" });

    // const rendered = await renderCartProductView(parsed, bgImgUrl, renderScale);

    // return new NextResponse(rendered, {
    //   ...easyCorsInit,
    //   headers: {
    //     "Content-Type": "image/jpeg",
    //     "Content-Disposition": "attachment; filename='my-product-view.jpg'",
    //   },
    // });
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
