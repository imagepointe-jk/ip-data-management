import { CustomGarmentSettings } from "@prisma/client";
import { prisma } from "../../../prisma/client";

export type GarmentSettingListing = CustomGarmentSettings & {
  imageUrl?: string;
};
export async function getGarmentSettings(): Promise<GarmentSettingListing[]> {
  const settings = await prisma.customGarmentSettings.findMany({
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
  const listings: GarmentSettingListing[] = settings.map((setting) => {
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
