import { z } from "zod";
import { ResultsPagination, SortingDirection } from "./misc";
import {
  Color,
  Design,
  DesignCategory,
  DesignSubcategory,
  DesignTag,
  DesignType,
  DesignVariation,
} from "@prisma/client";

const designVariationFormDataSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  colorId: z.number(),
  subcategoryIds: z.array(z.number()),
  tagIds: z.array(z.number()),
});

export const designFormDataSchema = z.object({
  designNumber: z.string(),
  description: z.string(),
  featured: z.boolean(),
  date: z.date().optional(),
  status: z.string(),
  subcategoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  designTypeId: z.string(),
  defaultBackgroundColorId: z.string(),
  imageUrl: z.string(),
  existingDesignId: z.number().optional(),
  priority: z.number().optional(),
  variationData: z.array(designVariationFormDataSchema),
});

const quoteRequestItemSchema = z.object({
  designId: z.number(),
  variationId: z.number().optional(),
  designNumber: z.string(),
  garmentColor: z.string(),
});

export const quoteRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.number(),
  union: z.string(),
  comments: z.string(),
  items: z.array(quoteRequestItemSchema),
});

export const designDataInterchangeRowSchema = z.object({
  ID: z.number(),
  Name: z.string().nullable().optional(),
  Description: z.string().nullable().optional(),
  ParentID: z.number().optional(),
  ParentDesignNumber: z.string().optional(),
  DesignNumber: z.string(),
  ImageUrl: z.string(),
  DesignType: z.string().optional(),
  DefaultBackgroundColorName: z.string(),
  DefaultBackgroundColorHexCode: z.string(),
  Featured: z.boolean().optional(),
  Status: z.string().optional(),
  Tags: z.string().optional(),
  TagIds: z.string().optional(),
  Subcategories: z.string().optional(),
  SubcategoryIds: z.string().optional(),
  Date: z.string().optional(),
  Priority: z.number().optional(),
});

//the format used in the old XLSX design library pseudo-database
export const designDataImportRowSchema = z.object({
  ["Design Number"]: z.string(),
  Name: z.string().optional(),
  Description: z.string().optional(),
  ["Default Background Color"]: z.string().optional(),
  Featured: z.string().optional(),
  Priority: z.number().optional(),
  ["Subcategory1 - Union"]: z.string().optional(),
  ["Subcategory2 - Holiday/Event"]: z.string().optional(),
  ["Subcategory3"]: z.string().optional(),
  ["Subcategory4"]: z.string().optional(),
  ["Subcategory5"]: z.string().optional(),
  ["Tag1"]: z.string().optional(),
  ["Tag2"]: z.string().optional(),
  ["Tag3"]: z.string().optional(),
  ["Tag4"]: z.string().optional(),
  ["Tag5"]: z.string().optional(),
  ["Tag6"]: z.string().optional(),
  ["Tag7"]: z.string().optional(),
  ["Tag8"]: z.string().optional(),
  ["Tag9"]: z.string().optional(),
  ["Tag10"]: z.string().optional(),
  ["Tag11"]: z.string().optional(),
  ["Tag12"]: z.string().optional(),
  ["Tag13"]: z.string().optional(),
  ["Tag14"]: z.string().optional(),
  ["Tag15"]: z.string().optional(),
  Date: z.string().optional(),
  ["Status"]: z.string().optional(),
  ["Image URL"]: z.string().optional(),
});

export const sortingTypes = ["Design Number", "Priority", "Date"] as const;
export const sortingTypeSchema = z.enum(sortingTypes);

export type SortingType = z.infer<typeof sortingTypeSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
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
  status?: "Published" | "Draft" | "Any";
  subcategory?: string;
  keyword?: string;
  before?: number; //timestamp
  after?: number; //timestamp
};
export type DesignResults = ResultsPagination & {
  designs: DesignWithIncludes[];
};

export type DesignVariationWithIncludes = DesignVariation & {
  color: Color;
  designSubcategories: DesignSubcategory[];
  designTags: DesignTag[];
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

export type DesignDataInterchangeRow = z.infer<
  typeof designDataInterchangeRowSchema
>;

export type DesignDataImportRow = z.infer<typeof designDataImportRowSchema>;
