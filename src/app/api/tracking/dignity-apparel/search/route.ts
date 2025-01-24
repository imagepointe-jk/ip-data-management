import { AppError } from "@/error";
import { message } from "@/utility/misc";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma/client";

export async function POST(request: NextRequest) {
  const json = await request.json();
  const search = json.search;

  try {
    if (typeof search !== "string")
      throw new AppError({
        type: "Client Request",
        clientMessage: "Search string not found",
        statusCode: BAD_REQUEST,
      });

    const created = await prisma.dignityApparelSearchString.create({
      data: {
        search,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof AppError) {
      if (error.serverMessage) console.error(error.serverMessage);
      return NextResponse.json(message(error.clientMessage), {
        status: error.statusCode,
      });
    }
  }
}
