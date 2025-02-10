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
      env.DA_PRODUCT_SYNC_NOTIFICATION_EMAIL,
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
      env.DA_PRODUCT_SYNC_NOTIFICATION_EMAIL,
      emailSubject,
      `Sync FAILED with the following error message: ${
        error instanceof Error ? error.message : "UNKNOWN ERROR"
      }`
    );
  }
}

//TODO: Start reporting on shortest, longest, and average row sync times
async function syncRows(
  syncData: SyncDataCache,
  productsFromDb: WooCommerceDAProduct[]
) {
  const syncErrors: { sku: string; error: string }[] = [];
  let successCount = 0;
  let processedCount = 0;
  const syncTimes: number[] = [];

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

      const startTime = Date.now();
      const syncResponse = await updateDAProductVariationStock(
        parentProduct.databaseId,
        variationFromDb.databaseId,
        row.Stock,
        row.Price
      );
      const endTime = Date.now();
      const syncResponseMs = endTime - startTime;
      syncTimes.push(syncResponseMs);
      if (!syncResponse.ok)
        throw new Error(
          `The syncing API call returned a ${
            syncResponse.status
          } status code after ${syncResponseMs / 1000} seconds.`
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

  for (const product of productsFromDb) {
    const availabilityAttribute = product.globalAttributes.find(
      (attr) => attr.name === "pa_availability"
    );
    const isMTO = !!availabilityAttribute?.terms.find(
      (term) => term.slug === "made-to-order"
    );
    const isDraft = product.status === "draft";
    if (isMTO || isDraft) continue;

    const variationsNotInSyncData = product.variations.filter(
      (variation) =>
        !syncData.importRows.find((row) => row.SKU === variation.sku)
    );
    for (const variation of variationsNotInSyncData) {
      syncErrors.push({
        sku: variation.sku,
        error:
          "This SKU was found in WooCommerce, but not in the sync data. It was not updated.",
      });
    }
  }

  syncTimes.sort((a, b) => a - b);
  const maxTime = syncTimes[syncTimes.length - 1] || 99999999;
  const minTime = syncTimes[0] || 0;
  const averageTime =
    syncTimes.reduce((accum, item) => accum + item, 0) / syncTimes.length;

  return {
    syncErrors,
    processedCount,
    successCount,
    syncTimes: {
      min: minTime,
      max: maxTime,
      average: averageTime,
    },
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
    syncTimes: {
      min: number;
      max: number;
      average: number;
    };
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
      minTime: syncResults.syncTimes.min,
      maxTime: syncResults.syncTimes.max,
      averageTime: syncResults.syncTimes.average,
      errors: syncResults.syncErrors,
    });
  } catch (error) {
    console.error(`Error sending the results email: ${error}`);
    emailBody = "FAILED TO GENERATE EMAIL BODY";
  }
  return sendEmail(recipientAddress, subject, emailBody);
}
