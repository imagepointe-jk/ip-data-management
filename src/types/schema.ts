import { z } from "zod";

export const userFormDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  existingUserId: z.number().optional(),
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
});

const quoteRequestDesignSchema = z.object({
  id: z.number(),
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
  designs: z.array(quoteRequestDesignSchema),
});

const productTypes = [
  "tshirt",
  "polo",
  "jacket",
  "sweats",
  "hat",
  "beanie",
] as const;
const decorationTypes = ["Screen Print", "Embroidery"] as const;
const decorationLocationSchema = z.object({
  colorCount: z.number().optional(),
  stitchCount: z.number().optional(),
});
export const calculatePriceParamsSchema = z.object({
  productData: z.object({
    type: z.enum(productTypes),
    net: z.number(),
  }),
  decorationType: z.enum(decorationTypes),
  quantity: z.number(),
  locations: z.array(decorationLocationSchema),
});

export const sortingTypes = ["Design Number"] as const;
export const sortingTypeSchema = z.enum(sortingTypes);

export const sortingDirections = ["Ascending", "Descending"] as const;
export const sortingDirectionSchema = z.enum(sortingDirections);

export type SortingType = z.infer<typeof sortingTypeSchema>;
export type SortingDirection = z.infer<typeof sortingDirectionSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export type DecorationLocation = z.infer<typeof decorationLocationSchema>;
export type CalculatePriceParams = z.infer<typeof calculatePriceParamsSchema>;
