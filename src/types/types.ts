import {
  Color,
  Design,
  DesignCategory,
  DesignSubcategory,
  DesignTag,
  DesignType,
  DesignVariation,
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

export type DesignVariationWithIncludes = DesignVariation & {
  color: Color;
};

export type DesignWithIncludes = Design & {
  designSubcategories: DesignSubcategory[];
  designTags: DesignTag[];
  designType: DesignType;
  defaultBackgroundColor: Color;
  variations: DesignVariationWithIncludes[];
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

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
