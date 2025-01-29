import { z } from "zod";

export const stockImportRowSchema = z.object({
  SKU: z.string(),
  ["Parent SKU"]: z.string(),
  Stock: z.number(),
});
export const syncDataCache = z.object({
  updatedAt: z.date(),
  importRows: z.array(stockImportRowSchema),
});

export type StockImportRow = z.infer<typeof stockImportRowSchema>;
export type SyncDataCache = z.infer<typeof syncDataCache>;
