import { handleRequestError } from "@/app/api/handleError";
import { easyCorsInit } from "@/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return Response.json({ message: "llamas" }, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}

//accommodate the browser's preflight request
export async function OPTIONS() {
  return new NextResponse(null, { ...easyCorsInit, status: 204 });
}
