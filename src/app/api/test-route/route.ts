import { NextResponse } from "next/server";

export function GET() {
  const date = new Date();
  return NextResponse.json({
    message: `The current time is ${date.toLocaleString()}`,
  });
}
