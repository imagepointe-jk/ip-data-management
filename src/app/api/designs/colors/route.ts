import { easyCorsInit } from "@/constants";
import { prisma } from "@/prisma";

export async function GET() {
  const colors = await prisma.color.findMany({
    where: {
      displayInDesignLibrary: true,
    },
  });

  return Response.json(colors, easyCorsInit);
}
