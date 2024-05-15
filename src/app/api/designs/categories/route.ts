import { easyCorsInit } from "@/constants";
import { prisma } from "../../../../../prisma/client";

export async function GET() {
  const categories = await prisma.designCategory.findMany({
    include: {
      designSubcategories: true,
      designType: true,
    },
  });

  return Response.json(categories, easyCorsInit);
}
