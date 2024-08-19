import { prisma } from "../../../prisma/client";

export async function getColors() {
  return prisma.color.findMany();
}
