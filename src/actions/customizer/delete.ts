"use server";
import { prisma } from "../../../prisma/client";

export async function deleteVariation(id: number) {
  return prisma.customProductSettingsVariation.delete({
    where: {
      id,
    },
  });
}
