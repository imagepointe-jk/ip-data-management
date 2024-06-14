import { prisma } from "../../../prisma/client";

export async function getGarmentSettings() {
  const settings = await prisma.customGarmentSettings.findMany();
  return settings;
}
