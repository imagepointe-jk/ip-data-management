"use server";

import { validateDesignFormData } from "@/types/validations";
import { prisma } from "../../prisma/client";
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

  revalidatePath("/designs");
  redirect("/designs");
}

export async function updateDesign(formData: FormData) {
  const parsed = validateDesignFormData(formData);
  if (!parsed.existingDesignId)
    throw new Error("No existing design id provided. This is a bug.");

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

  revalidatePath("/designs");
  redirect("/designs");
}

export async function deleteDesign(id: number) {
  await prisma.design.delete({
    where: {
      id,
    },
  });

  revalidatePath("/designs");
  redirect("/designs");
}

export async function createDesignVariation(parentDesignId: number) {
  const parentDesign = await prisma.design.findUnique({
    where: {
      id: parentDesignId,
    },
    include: {
      defaultBackgroundColor: true,
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
    },
  });
}

export async function deleteDesignVariation(id: number) {
  await prisma.designVariation.delete({
    where: {
      id,
    },
  });
}
