"use server";
import { prisma } from "../../../prisma/client";

export async function deleteVariation(id: number) {
  return prisma.customProductSettingsVariation.delete({
    where: {
      id,
    },
  });
}

export async function deleteView(id: number) {
  return prisma.customProductView.delete({
    where: {
      id,
    },
  });
}

export async function deleteLocation(id: number) {
  const deleted = await prisma.customProductDecorationLocation.delete({
    where: {
      id,
    },
  });
  return deleted.id;
}
