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
