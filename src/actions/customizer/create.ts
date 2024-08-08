"use server";
import { prisma } from "../../../prisma/client";

export async function createVariation(parentSettingsId: number) {
  const firstColor = await prisma.color.findFirst({
    orderBy: {
      id: "asc",
    },
  });
  if (!firstColor)
    throw new Error("No colors in the database to connect to a new variation.");

  return prisma.customProductSettingsVariation.create({
    data: {
      parentSettingsId,
      colorId: firstColor.id,
      views: {
        create: {
          name: "New View",
          imageUrl: "",
        },
      },
    },
    include: {
      color: true,
      views: true,
    },
  });
}

export async function createView(parentVariationId: number) {
  return prisma.customProductView.create({
    data: {
      parentVariationId,
      name: "New View",
      imageUrl: "",
    },
  });
}

export async function createLocation(parentViewId: number) {
  const created = await prisma.customProductDecorationLocation.create({
    data: {
      parentViewId,
      name: "New Location",
      positionX: 0,
      positionY: 0,
      width: 0.1,
      height: 0.1,
    },
  });

  return {
    ...created,
    positionX: created.positionX.toNumber(),
    positionY: created.positionY.toNumber(),
    width: created.width.toNumber(),
    height: created.height.toNumber(),
  };
}
