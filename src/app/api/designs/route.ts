import { getDesigns } from "@/db/access/designs";
import { prisma } from "../../../../prisma/client";
import { NextRequest } from "next/server";
import { easyCorsInit } from "@/constants";
import { makeStringTitleCase } from "@/utility/misc";

export async function GET(request: NextRequest) {
  //params to expect:
  //subcategories (rename to subcategory)
  //keywords
  //tags (ignored in previous backend)
  //perPage
  //pageNumber
  //designType
  //featured
  //allowDuplicateDesignNumbers
  //getRelatedToId
  //sortBy (will be "design number" or "priority")
  //similarTo
  //after (date)
  const params = request.nextUrl.searchParams;
  const featured = params.get("featured");
  const subcategory = params.get("subcategory");
  const keyword = params.get("keyword");
  const designType = decodeURIComponent(`${params.get("designType")}`);
  const allowDuplicateDesignNumbers = params.get("allowDuplicateDesignNumbers");
  // const getRelatedToId = params.get("getRelatedToId");
  const sortBy = params.get("sortBy");
  const similarTo = params.get("similarTo");
  const pageNumber = params.get("pageNumber");
  const perPage = params.get("perPage");
  const after = params.get("after");
  const before = params.get("before");

  const designs = await getDesigns({
    pageNumber: pageNumber ? +pageNumber : 1,
    perPage: perPage ? +perPage : 18,
    featuredOnly: featured ? featured === "true" : false,
    allowDuplicates: allowDuplicateDesignNumbers
      ? allowDuplicateDesignNumbers === "true"
      : false,
    designType: designType ? makeStringTitleCase(designType) : "Screen Print",
    keyword: keyword || undefined,
    similarToId: similarTo ? +similarTo : undefined,
    subcategory: subcategory || undefined,
    after: after && !isNaN(+after) ? +after : undefined,
    before: before && !isNaN(+before) ? +before : undefined,
    // getRelated: getRelatedToId
  });

  return Response.json(designs, easyCorsInit);
}
