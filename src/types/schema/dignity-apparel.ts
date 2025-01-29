import { z } from "zod";

export const stockImportRowSchema = z.object({
  SKU: z.string(),
  ["Parent SKU"]: z.string(),
  Stock: z.number(),
});

export type StockImportRow = z.infer<typeof stockImportRowSchema>;
