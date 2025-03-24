"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../prisma/client";
import { redirect } from "next/navigation";

export async function deleteDesign(id: number) {
  await prisma.design.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/designs");
  redirect("/admin/designs");
}

export async function deleteDesignVariation(id: number) {
  await prisma.designVariation.delete({
    where: {
      id,
    },
  });
}
