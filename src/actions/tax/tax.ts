"use server";

import { AppError } from "@/error";
import { createTaxRate, getTaxRates } from "@/fetch/woocommerce";
import { TaxImportRow, WooTaxRow } from "@/types/schema/tax";
import {
  validateTaxImportData,
  validateWooTaxRows,
} from "@/types/validations/tax";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/utility/statusCodes";

export async function uploadTaxData(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new AppError({
      type: "Client Request",
      clientMessage: "Invalid or missing file.",
      serverMessage: "Invalid or missing file.",
      statusCode: BAD_REQUEST,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "Data");
  const json = sheetToJson(sheet);
  const parsedImportRows = validateTaxImportData(json);

  const storeUrl = `${formData.get("url")}`;
  const storeKey = `${formData.get("key")}`;
  const storeSecret = `${formData.get("secret")}`;

  const existingRates = await getTaxRates({
    storeUrl,
    storeKey,
    storeSecret,
  });
  const parsedExistingRows = validateWooTaxRows(existingRates);

  const { rowsToCreate, rowsToUpdate } = chooseTaxImportOperations(
    parsedImportRows,
    parsedExistingRows
  );

  const createRequests: Promise<{ statusCode: number; message?: string }>[] =
    rowsToCreate.map(async (row) => {
      try {
        const response = await createTaxRate({
          storeUrl,
          storeKey,
          storeSecret,
          row,
        });
        if (!response.ok) {
          return {
            statusCode: response.status,
            message: "Unknown error.",
          };
        }
        return {
          statusCode: OK,
        };
      } catch (error) {
        console.error(error);
        return { statusCode: INTERNAL_SERVER_ERROR, message: "Unknown error." };
      }
    });

  const createResponses = await Promise.all(createRequests);
  console.log(createResponses);
}

function chooseTaxImportOperations(
  importRows: TaxImportRow[],
  existingRows: WooTaxRow[]
) {
  const rowsToCreate: TaxImportRow[] = [];
  const rowsToUpdate: { existingId: number; data: TaxImportRow }[] = [];

  for (const importRow of importRows) {
    const existingRow = existingRows.find(
      (existing) => existing.postcode === `${importRow.Zip}`
    );
    if (existingRow)
      rowsToUpdate.push({ existingId: existingRow.id, data: importRow });
    else rowsToCreate.push(importRow);
  }

  return { rowsToCreate, rowsToUpdate };
}
