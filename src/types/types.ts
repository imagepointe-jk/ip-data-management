import {
  Color,
  Design,
  DesignCategory,
  DesignSubcategory,
  DesignTag,
  DesignType,
} from "@prisma/client";

export type DesignQuery = {
  perPage?: number;
  pageNumber?: number;
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
