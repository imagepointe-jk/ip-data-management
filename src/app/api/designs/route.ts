import { getDesigns } from "@/db/access/designs";
import { prisma } from "../../../../prisma/client";
import { NextRequest } from "next/server";
import { easyCorsInit } from "@/constants";

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
  const params = request.nextUrl.searchParams;
  const featured = params.get("featured");
  const subcategories = params.get("subcategories");
  const keywords = params.get("keywords");
  const designType = params.get("designType");
  const allowDuplicateDesignNumbers = params.get("allowDuplicateDesignNumbers");
  const getRelatedToId = params.get("getRelatedToId");
  const sortBy = params.get("sortBy");
  const similarTo = params.get("similarTo");
  const pageNumber = params.get("pageNumber");
  const perPage = params.get("perPage");

  const designs = await getDesigns({
    pageNumber: pageNumber ? +pageNumber : 1,
    perPage: perPage ? +perPage : 18,
  });

  return Response.json(designs, easyCorsInit);
}
