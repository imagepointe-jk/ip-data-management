import { DesignQuery, DesignResults } from "@/types/types";
import { prisma } from "../../../prisma/client";
import { defaultPerPage } from "@/constants";

const standardDesignIncludes = {
  designSubcategories: true,
  designTags: true,
  designType: true,
  image: true,
  defaultBackgroundColor: true,
};

export async function getDesigns(query: DesignQuery): Promise<DesignResults> {
  const { pageNumber, perPage } = query;
  const countPerPage = perPage || defaultPerPage;

  const [matchingDesigns, paginatedMatchingDesigns] = await prisma.$transaction(
    [
      prisma.design.findMany(),
      prisma.design.findMany({
        include: standardDesignIncludes,
        take: countPerPage,
        skip: pageNumber ? countPerPage * (pageNumber - 1) : 0,
      }),
    ]
  );

  return {
    designs: paginatedMatchingDesigns,
    pageNumber: pageNumber || 1,
    perPage: countPerPage,
    totalResults: matchingDesigns.length,
  };
}

export async function getSingleDesign(id: number) {
  return prisma.design.findUnique({
    where: {
      id,
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
