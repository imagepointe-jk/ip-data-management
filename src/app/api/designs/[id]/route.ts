import { easyCorsInit } from "@/constants";
import { getSingleDesign } from "@/db/access/designs";
import { message } from "@/utility/misc";
import { BAD_REQUEST, NOT_FOUND } from "@/utility/statusCodes";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isNaN(+params.id))
    return Response.json(message("Bad request."), {
      ...easyCorsInit,
      status: BAD_REQUEST,
    });

  const design = await getSingleDesign(+params.id);
  if (!design)
    return Response.json(message(`Design ${params.id} not found.`), {
      ...easyCorsInit,
      status: NOT_FOUND,
    });

  return Response.json(design, easyCorsInit);
}
