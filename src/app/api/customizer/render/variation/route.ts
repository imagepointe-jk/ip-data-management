import { easyCorsInit } from "@/constants";
import { renderCartProductView } from "@/customizer/render";
import { validateCartStateProductVariation } from "@/types/validations/customizer";
import archiver from "archiver";
import { NextRequest, NextResponse } from "next/server";
import { Writable } from "stream";
import { prisma } from "../../../../../../prisma/client";
import { message } from "@/utility/misc";
import { INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";

//render all views of a product variation, zip them up, and send the zip file back
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateCartStateProductVariation(body);

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const zipBuffer: any[] = [];

    const writableStream = new Writable({
      write(chunk, _, callback) {
        zipBuffer.push(chunk);
        callback();
      },
    });

    archive.pipe(writableStream);

    for (const view of parsed.views) {
      //   const view = parsed.views[i]!;
      const viewData = await prisma.customProductView.findUnique({
        where: {
          id: view.id,
        },
      });
      if (!viewData) throw new Error(`Invalid view data id ${view.id}`);

      const rendered = await renderCartProductView(view, viewData.imageUrl);
      archive.append(Buffer.from(rendered), { name: `${viewData.name}.jpg` });
    }

    await archive.finalize();

    const zip = Buffer.concat(zipBuffer);

    return new NextResponse(zip, {
      ...easyCorsInit,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename='my-design.zip'",
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
