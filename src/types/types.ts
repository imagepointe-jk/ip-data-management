import {
  Color,
  Design,
  DesignCategory,
  DesignSubcategory,
  DesignTag,
  DesignType,
} from "@prisma/client";
import { SortingDirection, SortingType } from "./schema";
import { AppError } from "@/error";

export type DesignQuery = {
  perPage?: number;
  pageNumber?: number;
  designType?: string;
  designNumber?: number;
  sortBy?: {
    type: SortingType;
    direction: SortingDirection;
  };
  // getRelated?: boolean;
  similarToId?: number;
  allowDuplicates?: boolean;
  featuredOnly?: boolean;
  status?: "Published" | "Draft";
  subcategory?: string;
  keyword?: string;
  before?: number; //timestamp
  after?: number; //timestamp
};

type ResultsPagination = {
  perPage: number;
  pageNumber: number;
  totalResults: number;
};

export type DesignResults = ResultsPagination & {
  designs: DesignWithIncludes[];
};

export type DesignWithIncludes = Design & {
  designSubcategories: DesignSubcategory[];
  designTags: DesignTag[];
  designType: DesignType;
  defaultBackgroundColor: Color;
};

export type DesignCategoryWithIncludes = DesignCategory & {
  designSubcategories: DesignSubcategory[];
  designType: DesignType;
};

export type ServerActionResult = {
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
};
