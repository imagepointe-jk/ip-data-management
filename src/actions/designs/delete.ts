"use server";

import { prisma } from "../../../prisma/client";

export async function deleteDesign(id: number) {
  await prisma.design.delete({
    where: {
      id,
    },
  });
}

export async function deleteDesignVariation(id: number) {
  await prisma.designVariation.delete({
    where: {
      id,
    },
  });
}

export async function deleteAllDesignsPermanently() {
  await prisma.$transaction([
    prisma.designVariation.deleteMany(),
    prisma.design.deleteMany(),
  ]);
}

export async function deleteSubcategory(id: number) {
  return prisma.designSubcategory.delete({
    where: {
      id,
    },
  });
}
