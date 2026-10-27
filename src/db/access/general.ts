import { prisma } from "@/prisma";

export async function getWebstore(id: number) {
  return prisma.webstore.findUnique({
    where: {
      id,
    },
  });
}

export async function getWebstores() {}
