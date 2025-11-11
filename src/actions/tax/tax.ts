"use server";

import { AppError } from "@/error";
import {
  createTaxRate,
  getTaxRates,
  updateTaxRateBatch,
} from "@/fetch/woocommerce";
import { TaxImportRow, WooTaxRow } from "@/types/schema/tax";
import {
  validateTaxImportData,
  validateWooTaxRows,
} from "@/types/validations/tax";
import { batchArray } from "@/utility/misc";
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

  doSync({ parsedImportRows, storeKey, storeSecret, storeUrl });
}

async function doSync(params: {
  storeUrl: string;
  storeKey: string;
  storeSecret: string;
  parsedImportRows: TaxImportRow[];
}) {
  const { storeKey, storeSecret, storeUrl, parsedImportRows } = params;
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

  console.log(`Sending ${createRequests.length} create requests`);
  const createResponses = await Promise.all(createRequests);

  const batchedRowsToUpdate = batchArray(rowsToUpdate, 2);
  const batchUpdateRequests: Promise<{
    statusCode: number;
    message?: string;
    results: { existingId: number; success: boolean; message?: string }[];
  }>[] = batchedRowsToUpdate.map(async (batch) => {
    try {
      const response = await updateTaxRateBatch({
        storeUrl,
        storeKey,
        storeSecret,
        updates: batch,
      });
      if (!response.ok) {
        return {
          statusCode: response.status,
          message: "Unknown error.",
          results: [],
        };
      }
      const json = await response.json();
      const updateResult = json.update;
      if (!Array.isArray(updateResult)) {
        return {
          statusCode: INTERNAL_SERVER_ERROR,
          message: "Unknown error.",
          results: [],
        };
      }
      return {
        statusCode: OK,
        results: updateResult.map((item) => ({
          existingId: item.id,
          success: item.error !== undefined,
        })),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: INTERNAL_SERVER_ERROR,
        message: "Unknown error.",
        results: [],
      };
    }
  });
  console.log(
    `Sending ${batchUpdateRequests.length} batch update requests with ${rowsToUpdate.length} total updates`
  );

  const batchUpdateResponses = await Promise.all(batchUpdateRequests);
  console.log("DONE");
}

function chooseTaxImportOperations(
  importRows: TaxImportRow[],
  existingRows: WooTaxRow[]
) {
  const rowsToCreate: TaxImportRow[] = [];
  const rowsToUpdate: { existingId: number; data: TaxImportRow }[] = [];

  for (const importRow of importRows) {
    //TODO: This needs to correctly detect an existing match. Right now it only matches by zip, but there's at least one edge case where multiple Woo rows have the same zip but different cities.
    const existingRow = existingRows.find(
      (existing) => existing.postcode === `${importRow.Zip}`
    );
    if (existingRow)
      rowsToUpdate.push({ existingId: existingRow.id, data: importRow });
    else rowsToCreate.push(importRow);
  }

  return { rowsToCreate, rowsToUpdate };
}
