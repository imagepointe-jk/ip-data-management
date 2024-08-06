import {
  Color,
  CustomProductDecorationLocation,
  CustomProductSettings,
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { prisma } from "../../../prisma/client";

const productSettingIncludes = {
  variations: {
    include: {
      views: true,
    },
  },
};
export async function getProductSettings() {
  return prisma.customProductSettings.findMany({
    include: productSettingIncludes,
  });
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
