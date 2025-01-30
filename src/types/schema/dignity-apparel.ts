import { z } from "zod";

export const daProductImportRowSchema = z.object({
  SKU: z.string(),
  ["Parent SKU"]: z.string(),
  Stock: z.number(),
});
export const syncDataCache = z.object({
  updatedAt: z.date(),
  importRows: z.array(daProductImportRowSchema),
});

export type daProductImportRow = z.infer<typeof daProductImportRowSchema>;
export type SyncDataCache = z.infer<typeof syncDataCache>;
