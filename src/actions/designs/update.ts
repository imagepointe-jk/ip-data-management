"use server";

import { validateDesignFormData } from "@/types/validations/designs";
import { prisma } from "../../../prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateDesign(formData: FormData) {
  const parsed = validateDesignFormData(formData);
  if (!parsed.existingDesignId)
    throw new Error("No existing design id provided. This is a bug.");

  await Promise.all(
    parsed.variationData.map((variationData) =>
      prisma.designVariation.update({
        where: {
          id: variationData.id,
        },
        data: {
          colorId: variationData.colorId,
          imageUrl: variationData.imageUrl,
          designSubcategories: {
            set: variationData.subcategoryIds.map((id) => ({ id })),
          },
          designTags: {
            set: variationData.tagIds.map((id) => ({ id })),
          },
        },
      })
    )
  );

  await prisma.design.update({
    where: {
      id: parsed.existingDesignId,
    },
    data: {
      designNumber: parsed.designNumber,
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
      imageUrl: parsed.imageUrl,
      priority: parsed.priority,
    },
  });

  revalidatePath("/admin/designs");
  redirect("/admin/designs");
}
