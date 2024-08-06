import {
  Color,
  CustomProductDecorationLocation,
  CustomProductSettings,
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { prisma } from "../../../prisma/client";

export type ProductSettingListing = CustomProductSettings & {
  imageUrl?: string;
};
export async function getProductSettings(): Promise<ProductSettingListing[]> {
  const settings = await prisma.customProductSettings.findMany({
    include: {
      variations: {
        take: 1,
        include: {
          views: {
            take: 1,
          },
        },
      },
    },
  });
  const listings: ProductSettingListing[] = settings.map((setting) => {
    const firstVariation = setting.variations[0];
    if (!firstVariation) return setting;

    const firstView = firstVariation.views[0];
    if (!firstView) return setting;

    return {
      ...setting,
      imageUrl: firstView.imageUrl,
    };
  });

  return listings;
}

export type FullProductSettings = CustomProductSettings & {
  variations: (CustomProductSettingsVariation & { color: Color } & {
    views: (CustomProductView & {
      locations: CustomProductDecorationLocation[];
    })[];
  })[];
};
export async function getFullProductSettings(
  id: number
): Promise<FullProductSettings | null> {
  return prisma.customProductSettings.findUnique({
    where: {
      id,
    },
    include: {
      variations: {
        include: {
          views: {
            include: {
              locations: true,
            },
          },
          color: true,
        },
      },
    },
  });
}
