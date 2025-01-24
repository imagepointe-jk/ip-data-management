import { prisma } from "../../../prisma/client";

export function getDASearches() {
  return prisma.dignityApparelSearchString.findMany();
}
