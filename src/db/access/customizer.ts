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

export async function getProductSettingsWithIncludes() {
  const data = await prisma.customProductSettings.findMany({
    include: {
      variations: {
        orderBy: {
          id: "asc",
        },
        include: {
          views: {
            orderBy: {
              id: "asc",
            },
            include: {
              locations: true,
            },
          },
          color: true,
        },
      },
    },
  });

  return data.map((item) => convertFullProductSettings(item));
}

export type CustomProductDecorationLocationNumeric = {
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
        orderBy: {
          id: "asc",
        },
        include: {
          views: {
            orderBy: {
              id: "asc",
            },
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

  return convertFullProductSettings(settings);
}

export async function getQuoteRequests(params: {
  page: number;
  perPage: number;
}) {
  const { page, perPage } = params;

  const [paginatedResults, allResults] = await prisma.$transaction([
    prisma.customProductRequest.findMany({
      take: perPage,
      skip: perPage * (page - 1),
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.customProductRequest.findMany(),
  ]);

  return {
    totalResults: allResults.length,
    results: paginatedResults,
  };
}

export async function getQuoteRequest(id: number) {
  return prisma.customProductRequest.findUnique({
    where: {
      id,
    },
  });
}

//the productSettings data arrives with numbers in Decimal form.
//convert to make them more usable in various places.
function convertFullProductSettings(
  settings: CustomProductSettings & {
    variations: (CustomProductSettingsVariation & {
      views: (CustomProductView & {
        locations: CustomProductDecorationLocation[];
      })[];
      color: Color;
    })[];
  }
): FullProductSettings {
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
