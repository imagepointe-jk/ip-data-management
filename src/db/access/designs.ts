import { DesignQuery, DesignResults } from "@/types/types";
import { prisma } from "../../../prisma/client";
import { defaultPerPage } from "@/constants";
import { getArrayPage } from "@/utility/misc";
import { filterDesigns, sortDesigns } from "./designsFilterSort";

const standardDesignIncludes = {
  designSubcategories: true,
  designTags: true,
  designType: true,
  defaultBackgroundColor: true,
  variations: {
    include: {
      color: true,
      designSubcategories: true,
      designTags: true,
    },
  },
};

export async function getDesigns(query: DesignQuery): Promise<DesignResults> {
  //! If our design library ever gets very large, getting every design every time and processing them manually will become a performance problem.
  //! Currently this is not the case, and manual processing gives us the flexibility we need.
  //! Using this solution until a better one is found.
  const allDesignsInDb = await prisma.design.findMany({
    include: standardDesignIncludes,
  });
  //if we're getting designs similar to a specific design, get the specific design first
  const designForSimilarCheck =
    query.similarToId !== undefined
      ? await prisma.design.findUniqueOrThrow({
          where: { id: query.similarToId },
          include: standardDesignIncludes,
        })
      : undefined;
  const filtered = filterDesigns(allDesignsInDb, query, designForSimilarCheck);
  sortDesigns(filtered, query);

  const pageNumber = query.pageNumber || 1;
  const perPage = query.perPage || defaultPerPage;
  const paginated: DesignResults = {
    designs: getArrayPage(filtered, pageNumber, perPage),
    pageNumber,
    perPage,
    totalResults: filtered.length,
  };

  return paginated;
}

export async function getSingleDesign(id: number) {
  return prisma.design.findUnique({
    where: {
      id,
    },
    include: standardDesignIncludes,
  });
}

export async function getDesignsWithSameDesignNumber(designNumber: number) {
  return prisma.design.findMany({
    where: {
      designNumber: {
        equals: designNumber,
      },
    },
    include: standardDesignIncludes,
  });
}

export async function getDesignCategoryHierarchy() {
  return await prisma.designCategory.findMany({
    include: {
      designSubcategories: true,
      designType: true,
    },
  });
}
