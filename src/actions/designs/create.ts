"use server";

import { prisma } from "../../../prisma/client";
import { IMAGE_NOT_FOUND_URL } from "@/constants";

export async function createDesign(params?: { localDate?: Date }) {
  const defaultBgColor = await prisma.color.findFirst();
  if (!defaultBgColor)
    throw new Error("No color to associate with the new design");

  const defaultDesignType = await prisma.designType.findFirst();
  if (!defaultDesignType)
    throw new Error("No design typ eto associate with the new design");

  return prisma.design.create({
    data: {
      designNumber: "New Design",
      defaultBackgroundColorId: defaultBgColor.id,
      designTypeId: defaultDesignType.id,
      date: params?.localDate,
      imageUrl: IMAGE_NOT_FOUND_URL,
    },
  });
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

  return prisma.designVariation.create({
    data: {
      colorId: parentDesign.defaultBackgroundColor.id,
      parentDesignId,
      imageUrl: parentDesign.imageUrl,
      designSubcategories: {
        connect: parentDesign.designSubcategories,
      },
      designTags: { connect: parentDesign.designTags },
    },
    include: {
      color: true,
      designSubcategories: true,
      designTags: true,
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
