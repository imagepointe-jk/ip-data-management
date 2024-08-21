"use server";

import { FullProductSettings } from "@/db/access/customizer";
import { prisma } from "../../../prisma/client";

export async function updateProductSettings(settings: FullProductSettings) {
  const { published, wooCommerceId, variations } = settings;

  const allViews = settings.variations
    .map((variation) => variation.views)
    .flat();

  const allLocations = settings.variations
    .map((variation) => variation.views.map((view) => view.locations))
    .flat(2);

  await Promise.all([
    ...variations.map((variation) =>
      prisma.customProductSettingsVariation.update({
        where: {
          id: variation.id,
        },
        data: {
          colorId: variation.colorId,
        },
      })
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
      },
    }),
  ]);
}
