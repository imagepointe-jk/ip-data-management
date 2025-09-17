import {
  Color,
  CustomProductDecorationLocation,
  CustomProductSettings,
  CustomProductSettingsVariation,
  CustomProductView,
  ProductSizeOptions,
} from "@prisma/client";
import { prisma } from "../../../prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { FullProductSettingsDTO } from "@/types/dto/customizer";

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

export async function getProductSettingsWithIncludes(params?: {
  publishedOnly?: boolean;
}) {
  const data = await prisma.customProductSettings.findMany({
    where: {
      published: params?.publishedOnly || undefined,
    },
    orderBy: {
      order: "desc",
    },
    include: {
      variations: {
        orderBy: {
          order: "desc",
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
          sizeOptions: true,
        },
      },
    },
  });

  return data.map((item) => convertFullProductSettings(item));
}

export async function getFullProductSettings(
  id: number
): Promise<FullProductSettingsDTO | null> {
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
          sizeOptions: true,
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
      sizeOptions: ProductSizeOptions;
    })[];
  }
): FullProductSettingsDTO {
  const converted: FullProductSettingsDTO = {
    id: settings.id,
    order: settings.order,
    published: settings.published,
    wooCommerceId: settings.wooCommerceId,
    variations: settings.variations.map((variation) => ({
      ...variation,
      sizeOptions: variation.sizeOptions,
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
