import { env } from "@/env";
import {
  getDAProductsGQL,
  updateDAProductVariationStock,
} from "@/fetch/woocommerce";
import { SyncDataCache } from "@/types/schema/dignity-apparel";
import { WooCommerceDAProduct } from "@/types/schema/woocommerce";
import { validatedCachedSyncData } from "@/types/validations/dignity-apparel";
import { parseWooCommerceDAProductsResponse } from "@/types/validations/woo";
import { sendEmail } from "@/utility/mail";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { createClient } from "redis";

export async function doSync() {
  const startTime = new Date();
  const emailSubject = "DA Product Sync";
  const emailTo = "josh.klope@imagepointe.com";

  try {
    //first get the full product/variations hierarchy from WC
    const productsResponse = await getDAProductsGQL();
    if (!productsResponse.ok) {
      throw new Error(
        `Received a ${productsResponse.status} while trying to get initial products dataset.`
      );
    }
    const productsJson = await productsResponse.json();
    const productsParsed = parseWooCommerceDAProductsResponse(productsJson);
    console.log(
      "DA Product Sync: Received product hierarchy from WooCommerce."
    );

    //then get the cached sync data (should be updated each day)
    const client = await createClient({
      url: env.REDIS_URL,
    })
      .on("error", (err) => {
        throw new Error(`Redis error: ${err}`);
      })
      .connect();
    const cachedData = await client.get(env.REDIS_DA_PRODUCT_SYNC_CACHE_KEY);
    if (!cachedData) throw new Error("No cached data found in Redis.");
    const cacheParsed = validatedCachedSyncData(JSON.parse(cachedData));
    console.log(
      "DA Product Sync: Received cached data from the last uploaded spreadsheet."
    );

    //try to sync each row, using the SKUs from the sync data to find the correct database IDs for parent and variation products
    const syncResults = await syncRows(cacheParsed, productsParsed);
    console.log("DA Product Sync: Process complete.");

    const endTime = new Date();
    await sendResultsEmail(
      emailTo,
      emailSubject,
      startTime,
      endTime,
      cacheParsed.updatedAt,
      syncResults
    );
    console.log("DA Product Sync: Results email sent.");
  } catch (error) {
    console.error(error);
    await sendEmail(
      emailTo,
      emailSubject,
      `Sync FAILED with the following error message: ${
        error instanceof Error ? error.message : "UNKNOWN ERROR"
      }`
    );
  }
}

async function syncRows(
  syncData: SyncDataCache,
  productsFromDb: WooCommerceDAProduct[]
) {
  const syncErrors: { sku: string; error: string }[] = [];
  let successCount = 0;
  let processedCount = 0;

  for (const row of syncData.importRows) {
    console.log(`DA Product Sync: Syncing SKU ${row.SKU}...`);
    try {
      const parentProduct = productsFromDb.find(
        (product) => product.sku === row["Parent SKU"]
      );
      if (!parentProduct)
        throw new Error(
          `Parent product ${row["Parent SKU"]} not found in WooCommerce.`
        );
      const variationFromDb = parentProduct.variations.find(
        (variation) => variation.sku === row.SKU
      );
      if (!variationFromDb)
        throw new Error(
          `Variation ${row.SKU} not found under parent ${row["Parent SKU"]} in WooCommerce.`
        );

      const syncResponse = await updateDAProductVariationStock(
        parentProduct.databaseId,
        variationFromDb.databaseId,
        row.Stock,
        row.Price
      );
      if (!syncResponse.ok)
        throw new Error(
          `The syncing API call returned a ${syncResponse.status} status code.`
        );

      successCount++;
    } catch (error) {
      syncErrors.push({
        sku: row.SKU,
        error: error instanceof Error ? error.message : "UNKNOWN ERROR",
      });
    }
    processedCount++;
  }

  return {
    syncErrors,
    processedCount,
    successCount,
  };
}

function sendResultsEmail(
  recipientAddress: string,
  subject: string,
  startTime: Date,
  endTime: Date,
  updatedAt: Date,
  syncResults: {
    processedCount: number;
    successCount: number;
    syncErrors: { sku: string; error: string }[];
  }
) {
  let emailBody = "";
  try {
    const templateSource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/dignity-apparel/sync/products/syncResultsEmail.hbs"
      ),
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    emailBody = template({
      startedAt: startTime.toLocaleString(),
      endedAt: endTime.toLocaleString(),
      lastSyncUploadedAt: updatedAt.toLocaleString(),
      processedRowsCount: syncResults.processedCount,
      successCount: syncResults.successCount,
      failureCount: syncResults.syncErrors.length,
      errors: syncResults.syncErrors,
    });
  } catch (error) {
    console.error(`Error sending the results email: ${error}`);
    emailBody = "FAILED TO GENERATE EMAIL BODY";
  }
  return sendEmail(recipientAddress, subject, emailBody);
}
