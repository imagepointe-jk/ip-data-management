import {
  StockImportRow,
  stockImportRowSchema,
} from "../schema/dignity-apparel";

export function validateStockImportData(json: any) {
  if (!Array.isArray(json))
    throw new Error("The data received was not an array.");

  const parsed: StockImportRow[] = [];
  const errorIndices: number[] = [];
  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    const allCellsEmpty = !row.SKU && !row["Parent SKU"] && !row.Stock;
    if (!stockImportRowSchema.safeParse(row).success) {
      if (!allCellsEmpty) errorIndices.push(i);
    } else parsed.push(stockImportRowSchema.parse(row));
  }

  return {
    errorIndices,
    parsed,
  };
}
