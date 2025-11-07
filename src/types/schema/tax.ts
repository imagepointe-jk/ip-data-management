import { z } from "zod";

const taxImportRowSchema = z.object({
  State: z.string(),
  Zip: z.number(),
  City: z.string(),
  Rate: z.number(),
  TaxName: z.string(),
  Class: z.string(),
});
export const taxImportTableSchema = z.array(taxImportRowSchema);

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
