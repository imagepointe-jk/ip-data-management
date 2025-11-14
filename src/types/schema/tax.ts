import { z } from "zod";

const classOptions = ["standard", "clothing"] as const;
export const taxImportRowSchema = z.object({
  State: z.string(),
  Zip: z.string(),
  City: z.string(),
  Rate: z.number(),
  TaxName: z.string(),
  Class: z.enum(classOptions),
});

export const wooTaxRowSchema = z.object({
  id: z.number(),
  state: z.string(),
  postcode: z.string(),
  city: z.string(),
  rate: z.string(),
  name: z.string(),
  class: z.string(),
});

export type TaxImportRow = z.infer<typeof taxImportRowSchema>;
export type WooTaxRow = z.infer<typeof wooTaxRowSchema>;
export type TaxImportRowResult = {
  existingId?: number;
  statusCode?: number;
  success: boolean;
  message?: string;
  operation: "create" | "update";
} & TaxImportRow;
