import { easyCorsInit } from "@/constants";
import { prisma } from "../../../../prisma/client";

export async function GET() {
  const colors = await prisma.color.findMany();

  return Response.json(colors, easyCorsInit);
}
