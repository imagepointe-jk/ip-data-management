"use server";

import { revalidatePath } from "next/cache";
import { DesignDTO } from "@/types/dto/designs";
import { prisma } from "@/prisma";

export async function updateDesign(design: DesignDTO) {
  const {
    date,
    defaultBackgroundColorId,
    description,
    designNumber,
    designSubcategories,
    designTags,
    designTypeId,
    featured,
    id,
    imageUrl,
    priority,
    status,
    variations,
  } = design;

  const variationUpdates = variations
    ? variations.map((variation) =>
        prisma.designVariation.update({
          where: {
            id: variation.id,
          },
          data: {
            imageUrl: variation.imageUrl,
            colorId: variation.colorId,
            designSubcategories: {
              set: variation.designSubcategories.map((sub) => ({ id: sub.id })),
            },
            designTags: {
              set: variation.designTags.map((tag) => ({ id: tag.id })),
            },
          },
        })
      )
    : [];

  await prisma.$transaction([
    prisma.design.update({
      where: {
        id,
      },
      data: {
        designNumber,
        date,
        defaultBackgroundColorId,
        description,
        designTypeId,
        featured,
        imageUrl,
        priority,
        status,
        designSubcategories: designSubcategories
          ? {
              set: designSubcategories.map((sub) => ({ id: sub.id })),
            }
          : undefined,
        designTags: designTags
          ? {
              set: designTags.map((tag) => ({ id: tag.id })),
            }
          : undefined,
      },
    }),
    ...variationUpdates,
  ]);

  revalidatePath("/admin/designs");
}
