"use server";

import { AppError } from "@/error";
import {
  createTaxRate,
  getTaxRates,
  updateTaxRateBatch,
} from "@/fetch/woocommerce";
import {
  TaxImportRow,
  TaxImportRowResult,
  WooTaxRow,
} from "@/types/schema/tax";
import {
  validateTaxImportData,
  validateWooTaxRows,
} from "@/types/validations/tax";
import { sendEmail } from "@/utility/mail";
import { batchArray } from "@/utility/misc";
import {
  dataToSheetBuffer,
  getSheetFromBuffer,
  sheetToJson,
} from "@/utility/spreadsheet";
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

  const createRequests: Promise<TaxImportRowResult>[] = rowsToCreate.map(
    async (row) => {
      //initialize default result
      const result: TaxImportRowResult = {
        success: false,
        ...row,
        operation: "create",
      };

      try {
        const response = await createTaxRate({
          storeUrl,
          storeKey,
          storeSecret,
          row,
        });

        if (!response.ok) {
          result.statusCode = response.status;
          result.message = "Unknown error.";
          return result;
        }

        result.statusCode = OK;
        result.success = true;

        return result;
      } catch (error) {
        console.error(error);

        result.statusCode = INTERNAL_SERVER_ERROR;
        result.message = `${error}`;

        return result;
      }
    }
  );

  console.log(`Sending ${createRequests.length} create requests`);
  const createResponses = await Promise.all(createRequests);

  const batchedRowsToUpdate = batchArray(rowsToUpdate, 2);
  const batchUpdateRequests: Promise<{
    statusCode: number;
    message?: string;
    results: TaxImportRowResult[];
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
        results: updateResult.map((itemFromUpdateResults, i) => {
          const itemFromBatch = batch[i]!; //it appears that WC sends the batch update results back in the same order the batch was sent in
          const result: TaxImportRowResult = {
            ...itemFromBatch,
            success: itemFromUpdateResults.error === undefined,
            operation: "update",
            message:
              itemFromUpdateResults.error !== undefined
                ? `Failed to update existing record: ${itemFromUpdateResults.error.message}`
                : undefined,
          };
          return result;
        }),
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
  const unbatchedResults = unbatchUpdateResults(batchUpdateResponses);
  const createAndUpdateResults = [...createResponses, ...unbatchedResults];
  console.log("DONE");

  const sheetBuffer = dataToSheetBuffer(
    createAndUpdateResults,
    "tax import results"
  );
  sendEmail(
    "josh.klope@imagepointe.com",
    "Tax Import Results",
    "The results are attached",
    [{ content: sheetBuffer, filename: "tax import results.xlsx" }]
  );
}

function chooseTaxImportOperations(
  importRows: TaxImportRow[],
  existingRows: WooTaxRow[]
) {
  const rowsToCreate: TaxImportRow[] = [];
  const rowsToUpdate: (TaxImportRow & { existingId: number })[] = [];

  for (const importRow of importRows) {
    //TODO: This needs to correctly detect an existing match. Right now it only matches by zip, but there's at least one edge case where multiple Woo rows have the same zip but different cities.
    const existingRow = existingRows.find(
      (existing) => existing.postcode === `${importRow.Zip}`
    );
    if (existingRow)
      rowsToUpdate.push({ existingId: existingRow.id, ...importRow });
    else rowsToCreate.push(importRow);
  }

  return { rowsToCreate, rowsToUpdate };
}

function unbatchUpdateResults(
  responses: {
    statusCode: number;
    message?: string;
    results: TaxImportRowResult[];
  }[]
): TaxImportRowResult[] {
  let unbatched: TaxImportRowResult[] = [];

  for (const response of responses) {
    unbatched = [...unbatched, ...response.results];
  }

  return unbatched;
}

export async function exportTaxData(formData: FormData) {
  const storeUrl = `${formData.get("url")}`;
  const storeKey = `${formData.get("key")}`;
  const storeSecret = `${formData.get("secret")}`;
  const targetEmail = `${formData.get("email")}`;

  doExport({ storeKey, storeSecret, storeUrl, targetEmail });
}

async function doExport(params: {
  storeUrl: string;
  storeKey: string;
  storeSecret: string;
  targetEmail: string;
}) {
  const { storeKey, storeSecret, storeUrl, targetEmail } = params;
  const rates = await getTaxRates({
    storeUrl,
    storeKey,
    storeSecret,
  });
  const sheetBuffer = dataToSheetBuffer(rates, "rates");
  sendEmail(targetEmail, "Tax Rates", "The tax rates are attached", [
    { content: sheetBuffer, filename: "tax rates.xlsx" },
  ]);
}
