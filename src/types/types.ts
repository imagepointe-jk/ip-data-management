import {
  Color,
  Design,
  DesignSubcategory,
  DesignTag,
  DesignType,
  Image,
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
  image: Image | null;
  defaultBackgroundColor: Color;
};
