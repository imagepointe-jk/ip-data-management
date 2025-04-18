import { z } from "zod";

const productTypes = [
  "tshirt",
  "polo",
  "jacket",
  "sweats",
  "hat",
  "beanie",
] as const;
const productCalcTypeSchema = z.enum(productTypes);
const decorationTypes = ["Screen Print", "Embroidery"] as const;
const decorationTypeSchema = z.enum(decorationTypes);
const decorationLocationSchema = z.object({
  colorCount: z.number().optional(),
  stitchCount: z.number().optional(),
});
export const calculatePriceParamsSchema = z.object({
  productData: z.object({
    type: productCalcTypeSchema,
    net: z.number(),
    isAllPoly: z.boolean().optional(),
    isSweatshirt: z.boolean().optional(),
  }),
  decorationType: decorationTypeSchema,
  quantities: z.array(z.number()),
  locations: z.array(decorationLocationSchema),
});
export const iframeDataSchema = z.object({
  decorationType: z.string(),
  isAllPoly: z.boolean(),
  isSweatshirt: z.boolean(),
  markupSchedule: z.string(),
  net: z.number(),
});
export const estimateResponseSchema = z.object({
  results: z.array(
    z.object({
      quantity: z.number(),
      result: z.number(),
    })
  ),
});

export type DecorationType = z.infer<typeof decorationTypeSchema>;
export type DecorationLocation = z.infer<typeof decorationLocationSchema>;
export type CalculatePriceParams = z.infer<typeof calculatePriceParamsSchema>;
export type ProductCalcType = z.infer<typeof productCalcTypeSchema>;
export type IframeData = z.infer<typeof iframeDataSchema>;
export type EstimateResponse = z.infer<typeof estimateResponseSchema>;
