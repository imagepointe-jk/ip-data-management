import { message } from "@/utility/misc";
import { NextRequest } from "next/server";
import { prisma } from "../../../../../../prisma/client";
import { easyCorsInit } from "@/constants";
import { BAD_REQUEST, NOT_FOUND } from "@/utility/statusCodes";
import { getDesignsWithSameDesignNumber } from "@/db/access/designs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(isNaN(+params.id));
  if (isNaN(+params.id))
    return Response.json(message("Bad request."), {
      ...easyCorsInit,
      status: BAD_REQUEST,
    });

  const designWithId = await prisma.design.findUnique({
    where: {
      id: +params.id,
    },
  });
  if (!designWithId)
    return Response.json(message(`Design ${params.id} not found.`), {
      ...easyCorsInit,
      status: NOT_FOUND,
    });

  const designsWithSameDesignNumber = await getDesignsWithSameDesignNumber(
    designWithId.designNumber
  );

  return Response.json(designsWithSameDesignNumber, easyCorsInit);
}
