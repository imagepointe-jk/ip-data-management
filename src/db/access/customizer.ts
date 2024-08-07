import {
  Color,
  CustomProductDecorationLocation,
  CustomProductSettings,
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { prisma } from "../../../prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export async function getProductSettings() {
  return prisma.customProductSettings.findMany({
    include: {
      variations: {
        include: {
          views: true,
        },
      },
    },
  });
}

type CustomProductDecorationLocationNumeric = {
  [K in keyof CustomProductDecorationLocation]: CustomProductDecorationLocation[K] extends Decimal
    ? number
    : CustomProductDecorationLocation[K];
};

export type FullProductSettings = CustomProductSettings & {
  variations: (CustomProductSettingsVariation & { color: Color } & {
    views: (CustomProductView & {
      locations: CustomProductDecorationLocationNumeric[];
    })[];
  })[];
};
export async function getFullProductSettings(
  id: number
): Promise<FullProductSettings | null> {
  const settings = await prisma.customProductSettings.findUnique({
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

  if (!settings) throw new Error(`Product settings ${id} not found.`);

  //convert the decimal values to numbers
  const converted: FullProductSettings = {
    ...settings,
    variations: settings.variations.map((variation) => ({
      ...variation,
      views: variation.views.map((view) => ({
        ...view,
        locations: view.locations.map((location) => ({
          ...location,
          positionX: location.positionX.toNumber(),
          positionY: location.positionY.toNumber(),
          width: location.width.toNumber(),
          height: location.height.toNumber(),
        })),
      })),
    })),
  };

  return converted;
}
