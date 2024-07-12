import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);
    console.log(
      "======================origin: ",
      request.headers.get("origin")
    );
    console.log(
      "======================referer: ",
      request.headers.get("referer")
    );

    return Response.json({}, easyCorsInit);
  } catch (error) {
    console.error(error);
    return Response.json({}, easyCorsInit);
  }
}
