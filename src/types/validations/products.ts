import { getSheetCellValue } from "@/utility/spreadsheet";
import { WorkSheet } from "xlsx";
import {
  ASIProductImportData,
  generalProductImportSchema,
} from "../schema/products";
import { z } from "zod";
import { normalizeObjectKeys } from "@/utility/misc";

const MAX_EMPTY_SKU_CELLS = 100; //if we find this many empty cells in a row in the SKU column, assume that we have found all product entries in the spreadsheet
const ASI_SKU_COLUMN = 2;
const ASI_PRICING_TABLE_START_COLUMN = 6;
const ASI_PRICING_TABLE_END_COLUMN = 15;
const ASI_PRICING_TABLE_ROW_OFFSET = 6; //the pricing table starts this many rows below the SKU row
const ASI_VENDOR_NAME_ROW_OFFSET = 1;
const ASI_VENDOR_SKU_ROW_OFFSET = 2;
const ASI_DESCRIPTION_ROW_OFFSET = 4;
const ASI_PRIMARY_DATA_COLUMN = 4;

//the spreadsheet is structured in a very specific way and data for each product fills up multiple rows.
//zod is not very helpful in this case, so use custom parsing logic instead.
export function validateASIProducts(sheet: WorkSheet) {
  const products: ASIProductImportData[] = [];
  let emptySkuCells = 0; //tracks how many cells in the "SKU" column have been empty. resets to 0 when a value in this column is found.
  for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
    const sku = getSheetCellValue(ASI_SKU_COLUMN, i, sheet);
    if (sku) {
      emptySkuCells = 0;
      try {
        const data = pullLocalProductValues(i, sheet);
        products.push(data);
      } catch (error) {
        console.error(`Error parsing product data for sku ${sku}: ${error}`);
      }
    } else {
      emptySkuCells++;
    }

    if (i > 999999) {
      console.error("Looped through too many rows!"); //this should never print
      break;
    }

    if (emptySkuCells >= MAX_EMPTY_SKU_CELLS) break;
  }

  return products;
}

//called when a SKU has been found; pull values from the area near the SKU based on predetermined spreadsheet formatting/structure
function pullLocalProductValues(
  rowNumber: number,
  sheet: WorkSheet,
): ASIProductImportData {
  const sku = `${getSheetCellValue(ASI_SKU_COLUMN, rowNumber, sheet)}`;
  const vendorName = `${getSheetCellValue(
    ASI_PRIMARY_DATA_COLUMN,
    rowNumber + ASI_VENDOR_NAME_ROW_OFFSET,
    sheet,
  )}`;
  const vendorSku = `${getSheetCellValue(
    ASI_PRIMARY_DATA_COLUMN,
    rowNumber + ASI_VENDOR_SKU_ROW_OFFSET,
    sheet,
  )}`;
  const description = `${getSheetCellValue(
    ASI_PRIMARY_DATA_COLUMN,
    rowNumber + ASI_DESCRIPTION_ROW_OFFSET,
    sheet,
  )}`;
  const priceBreaks: { quantity: string; price: string }[] = [];

  for (
    let i = ASI_PRICING_TABLE_START_COLUMN;
    i < ASI_PRICING_TABLE_END_COLUMN + 1;
    i++
  ) {
    const quantity = getSheetCellValue(
      i,
      rowNumber + ASI_PRICING_TABLE_ROW_OFFSET,
      sheet,
    );
    const price = getSheetCellValue(
      i,
      rowNumber + ASI_PRICING_TABLE_ROW_OFFSET + 1,
      sheet,
    );

    if (!quantity || !price) break;

    const formattedPrice = !isNaN(+price) ? `$${(+price).toFixed(2)}` : price;

    if (quantity && price)
      priceBreaks.push({ quantity, price: formattedPrice });
  }

  return { sku, vendorName, vendorSku, description, priceBreaks };
}

export function validateGeneralProductSheet(json: any) {
  if (!Array.isArray(json)) throw new Error("Not an array");

  return json.map((row) => {
    const normalized = normalizeObjectKeys(row);
    normalized.published =
      normalized.published === "y"
        ? true
        : normalized.published === "n"
          ? false
          : undefined;

    return generalProductImportSchema.parse(normalized);
  });
}
