import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("RECEIVED REQUEST");
  try {
    const body = await request.json();
    console.log(JSON.stringify(body));
    console.log(
      "======================origin: ",
      request.headers.get("origin")
    );
    console.log(
      "======================referer: ",
      request.headers.get("referer")
    );
    console.log("======================full headers: ", request.headers);

    return Response.json({}, easyCorsInit);
  } catch (error) {
    console.error(error);
    return Response.json({}, easyCorsInit);
  }
}
