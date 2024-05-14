"use server";

import { validateDesignFormData } from "@/types/validations";
import { prisma } from "../../prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateDesign(formData: FormData) {
  const parsed = validateDesignFormData(formData);
  if (!parsed.existingDesignId)
    throw new Error("No existing design id provided. This is a bug.");

  await prisma.design.update({
    where: {
      id: parsed.existingDesignId,
    },
    data: {
      description: parsed.description,
      featured: parsed.featured,
      date: parsed.date,
      status: parsed.status,
      designSubcategories: {
        set: parsed.subcategoryIds.map((id) => ({ id: +id })),
      },
      designTags: {
        set: parsed.tagIds.map((id) => ({ id: +id })),
      },
      designTypeId: +parsed.designTypeId,
      defaultBackgroundColorId: +parsed.defaultBackgroundColorId,
    },
  });

  revalidatePath("/designs");
  redirect("/designs");
}
