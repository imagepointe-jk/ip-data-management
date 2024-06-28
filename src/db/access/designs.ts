import { DesignQuery, DesignResults } from "@/types/types";
import { prisma } from "../../../prisma/client";
import { defaultPerPage } from "@/constants";
import { makeStringTitleCase } from "@/utility/misc";

const standardDesignIncludes = {
  designSubcategories: true,
  designTags: true,
  designType: true,
  defaultBackgroundColor: true,
  variations: {
    include: {
      color: true,
    },
  },
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
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            designSubcategories: {
              some: {
                name: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            designTags: {
              some: {
                name: {
                  contains: keyword,
                  mode: "insensitive",
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

  function buildOrderBy(): any {
    const defaultSort = [
      {
        priority: "desc",
      },
      {
        designNumber: "desc",
      },
    ];
    const dir = sortBy?.direction === "Ascending" ? "asc" : "desc";
    if (!sortBy) return defaultSort;

    if (sortBy.type === "Design Number") {
      return {
        designNumber: dir,
      };
    }
    if (sortBy.type === "Priority") {
      return {
        priority: dir,
      };
    }
    if (sortBy.type === "Date") {
      return {
        date: dir,
      };
    }

    return defaultSort;
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
        orderBy: buildOrderBy(),
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
