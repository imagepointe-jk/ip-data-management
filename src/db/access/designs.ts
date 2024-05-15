import { DesignQuery, DesignResults } from "@/types/types";
import { prisma } from "../../../prisma/client";
import { defaultPerPage } from "@/constants";
import { makeStringTitleCase } from "@/utility/misc";

const standardDesignIncludes = {
  designSubcategories: true,
  designTags: true,
  designType: true,
  defaultBackgroundColor: true,
};

export async function getDesigns(query: DesignQuery): Promise<DesignResults> {
  const {
    pageNumber,
    perPage,
    after,
    allowDuplicates,
    before,
    designNumber,
    designType,
    featuredOnly,
    keyword,
    sortBy,
    status,
    subcategory,
  } = query;
  const countPerPage = perPage || defaultPerPage;
  console.log("design type", designType);

  function buildWhere() {
    const where: any = { AND: [] };
    if (designType)
      where.AND.push({
        designType: {
          name: {
            equals: designType,
          },
        },
      });
    if (status)
      where.AND.push({
        status: {
          equals: status,
        },
      });
    if (subcategory)
      where.AND.push({
        designSubcategories: {
          some: {
            name: subcategory,
          },
        },
      });
    if (featuredOnly === true)
      where.AND.push({
        featured: {
          equals: featuredOnly,
        },
      });
    if (designNumber)
      where.AND.push({
        designNumber: {
          equals: designNumber,
        },
      });
    if (keyword)
      //TODO: Figure out how to make this case-insensitive
      where.AND.push({
        OR: [
          {
            name: {
              contains: keyword,
            },
          },
          {
            description: {
              contains: keyword,
            },
          },
          {
            designSubcategories: {
              some: {
                name: {
                  contains: keyword,
                },
              },
            },
          },
          {
            designTags: {
              some: {
                name: {
                  contains: keyword,
                },
              },
            },
          },
        ],
      });
    if (before)
      where.AND.push({
        date: {
          lt: new Date(before),
        },
      });
    if (after)
      where.AND.push({
        date: {
          gt: new Date(after),
        },
      });
    return where;
  }

  const [matchingDesigns, paginatedMatchingDesigns] = await prisma.$transaction(
    [
      prisma.design.findMany({
        where: buildWhere(),
        distinct: !allowDuplicates ? ["designNumber"] : undefined,
      }),
      prisma.design.findMany({
        include: standardDesignIncludes,
        where: buildWhere(),
        distinct: !allowDuplicates ? ["designNumber"] : undefined,
        take: countPerPage,
        skip: pageNumber ? countPerPage * (pageNumber - 1) : 0,
        orderBy: sortBy
          ? {
              designNumber:
                sortBy.type === "Design Number" &&
                sortBy.direction === "Ascending"
                  ? "asc"
                  : "desc",
            }
          : {
              designNumber: "desc",
            },
      }),
    ]
  );

  console.log(matchingDesigns[matchingDesigns.length - 1]);

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
