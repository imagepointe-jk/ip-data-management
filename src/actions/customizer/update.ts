"use server";

import { FullProductSettings } from "@/db/access/customizer";
import { prisma } from "../../../prisma/client";
import { CustomProductRequest } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateProductSettings(settings: FullProductSettings) {
  const { published, wooCommerceId, order, variations } = settings;

  const allViews = settings.variations
    .map((variation) => variation.views)
    .flat();

  const allLocations = settings.variations
    .map((variation) => variation.views.map((view) => view.locations))
    .flat(2);

  await Promise.all([
    ...variations.map((variation) =>
      Promise.all([
        prisma.customProductSettingsVariation.update({
          where: {
            id: variation.id,
          },
          data: {
            colorId: variation.colorId,
          },
        }),
        prisma.productSizeOptions.update({
          where: {
            id: variation.sizeOptions.id,
          },
          data: {
            sizeSmall: variation.sizeOptions.sizeSmall,
            sizeMedium: variation.sizeOptions.sizeMedium,
            sizeLarge: variation.sizeOptions.sizeLarge,
            sizeXL: variation.sizeOptions.sizeXL,
            size2XL: variation.sizeOptions.size2XL,
            size3XL: variation.sizeOptions.size3XL,
            size4XL: variation.sizeOptions.size4XL,
            size5XL: variation.sizeOptions.size5XL,
            size6XL: variation.sizeOptions.size6XL,
          },
        }),
      ])
    ),
    ...allLocations.map((location) =>
      prisma.customProductDecorationLocation.update({
        where: {
          id: location.id,
        },
        data: location,
      })
    ),
    ...allViews.map((view) =>
      prisma.customProductView.update({
        where: {
          id: view.id,
        },
        data: {
          imageUrl: view.imageUrl,
          name: view.name,
        },
      })
    ),
    prisma.customProductSettings.update({
      where: {
        id: settings.id,
      },
      data: {
        published,
        wooCommerceId,
        order,
      },
    }),
  ]);

  revalidatePath("/customizer");
}

export async function updateQuoteRequest(data: CustomProductRequest) {
  return prisma.customProductRequest.update({
    where: {
      id: data.id,
    },
    data,
  });
}
