"use server";

import { prisma } from "@/prisma";
import { Color } from "@prisma/client";

export async function updateColors(colors: Color[]) {
  return prisma.$transaction(
    colors.map((color) =>
      prisma.color.update({ where: { id: color.id }, data: color })
    )
  );
}
