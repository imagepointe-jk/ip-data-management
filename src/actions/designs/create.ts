"use server";

import { validateDesignFormData } from "@/types/validations/designs";
import { prisma } from "../../../prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDesign(formData: FormData) {
  const parsed = validateDesignFormData(formData);

  await prisma.design.create({
    data: {
      designNumber: parsed.designNumber,
      description: parsed.description,
      featured: parsed.featured,
      date: parsed.date || new Date(),
      status: parsed.status,
      designSubcategories: {
        connect: parsed.subcategoryIds.map((id) => ({ id: +id })),
      },
      designTags: {
        connect: parsed.tagIds.map((id) => ({ id: +id })),
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

export async function createDesignVariation(parentDesignId: number) {
  const parentDesign = await prisma.design.findUnique({
    where: {
      id: parentDesignId,
    },
    include: {
      defaultBackgroundColor: true,
      designSubcategories: true,
      designTags: true,
    },
  });

  if (!parentDesign) {
    throw new Error(`Parent design with id ${parentDesignId} not found.`);
  }

  await prisma.designVariation.create({
    data: {
      colorId: parentDesign.defaultBackgroundColor.id,
      parentDesignId,
      imageUrl: parentDesign.imageUrl,
      designSubcategories: {
        connect: parentDesign.designSubcategories,
      },
      designTags: { connect: parentDesign.designTags },
    },
  });
}

export async function createTag(name: string) {
  return await prisma.designTag.create({
    data: {
      name,
    },
  });
}

export async function createCategory(name: string, designTypeId: number) {
  return prisma.designCategory.create({
    data: {
      name,
      designTypeId,
    },
  });
}

export async function createSubcategory(
  name: string,
  parentCategoryId: number
) {
  return prisma.designSubcategory.create({
    data: {
      name,
      designCategoryId: parentCategoryId,
    },
  });
}
