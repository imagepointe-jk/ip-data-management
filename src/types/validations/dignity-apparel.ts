import {
  daProductImportRow,
  daProductImportRowSchema,
  syncDataCache,
} from "../schema/dignity-apparel";

export function validateStockImportData(json: any) {
  if (!Array.isArray(json))
    throw new Error("The data received was not an array.");

  const parsed: daProductImportRow[] = [];
  const errorIndices: number[] = [];
  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    const allCellsEmpty = !row.SKU && !row["Parent SKU"] && !row.Stock;
    if (!daProductImportRowSchema.safeParse(row).success) {
      if (!allCellsEmpty) errorIndices.push(i);
    } else parsed.push(daProductImportRowSchema.parse(row));
  }

  return {
    errorIndices,
    parsed,
  };
}

export function validatedCachedSyncData(json: any) {
  return syncDataCache.parse({ ...json, updatedAt: new Date(json.updatedAt) });
}
