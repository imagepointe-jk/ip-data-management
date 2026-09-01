"use server";

import { env } from "@/env";
import { AppError } from "@/error";
import { searchIPProducts, updateIPProduct } from "@/fetch/woocommerce";
import { ASIProductImportData } from "@/types/schema/products";
import { validateASIProducts } from "@/types/validations/products";
import { getSheetFromBuffer } from "@/utility/spreadsheet";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/utility/statusCodes";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { sendEmail } from "@/utility/mail";
import { WooCommerceProduct } from "@/types/schema/woocommerce";
import { parseWooCommerceProduct } from "@/types/validations/woo";
import { inspect } from "util";

export async function startSync(formData: FormData) {
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
  const asiSheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "ASI");
  const parsed = validateASIProducts(asiSheet);
  runSync(parsed);
  console.log("WooCommerce product sync initiated.");
}

async function runSync(data: ASIProductImportData[]) {
  const startTime = new Date();
  const syncResults = await syncRows(data);

  const endTime = new Date();
  await sendResultsEmail(
    env.IP_PRODUCT_SYNC_NOTIFICATION_EMAIL,
    startTime,
    endTime,
    syncResults,
  );
}

async function syncRows(productData: ASIProductImportData[]) {
  const syncErrors: { sku: string; error: string }[] = [];
  let successCount = 0;
  let processedCount = 0;
  const syncTimes: number[] = [];

  for (let i = 0; i < productData.length; i++) {
    const data = productData[i]!;
    try {
      console.log(
        `Syncing SKU ${data.sku} (${i + 1} of ${productData.length})...`,
      );
      const searchResponse = await searchIPProducts(data.sku);
      if (!searchResponse.ok)
        throw new Error(
          `Search for the product returned a ${searchResponse.status} status`,
        );

      const searchJson = await searchResponse.json();
      if (!Array.isArray(searchJson))
        throw new Error(`Unable to search for product with SKU ${data.sku}`);

      const matchingResult = searchJson.find(
        (item) =>
          `${item.sku}`.toLocaleLowerCase() === data.sku.toLocaleLowerCase(),
      );
      if (!matchingResult)
        throw new Error(
          `Couldn't find product with SKU ${data.sku} in the database`,
        );

      const startTime = Date.now();
      const updateResponse = await updateIPProduct(+matchingResult.id, {
        priceBreaks: {
          break1: data.priceBreaks[0],
          break2: data.priceBreaks[1],
          break3: data.priceBreaks[2],
          break4: data.priceBreaks[3],
          break5: data.priceBreaks[4],
        },
      });
      const endTime = Date.now();
      const syncResponseMs = endTime - startTime;
      syncTimes.push(syncResponseMs);
      if (!updateResponse.ok)
        throw new Error(
          `The update request returned a ${updateResponse.status} status`,
        );

      successCount++;
    } catch (error) {
      syncErrors.push({
        sku: data.sku,
        error: error instanceof Error ? error.message : "UNKNOWN ERROR",
      });
      console.error(`Failed to sync SKU ${data.sku}: ${error}`);
    }
    processedCount++;
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
      min: minTime / 1000,
      max: maxTime / 1000,
      average: averageTime / 1000,
    },
  };
}

function sendResultsEmail(
  recipientAddress: string,
  startTime: Date,
  endTime: Date,
  syncResults: {
    processedCount: number;
    successCount: number;
    syncTimes: {
      min: number;
      max: number;
      average: number;
    };
    syncErrors: { sku: string; error: string }[];
  },
) {
  let emailBody = "";
  try {
    const templateSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/actions/products/syncResultsEmail.hbs"),
      "utf-8",
    );
    const template = handlebars.compile(templateSource);
    emailBody = template({
      startedAt: startTime.toLocaleString(),
      endedAt: endTime.toLocaleString(),
      processedRowsCount: syncResults.processedCount,
      successCount: syncResults.successCount,
      failureCount: syncResults.syncErrors.length,
      minTime: syncResults.syncTimes.min.toFixed(2),
      maxTime: syncResults.syncTimes.max.toFixed(2),
      averageTime: syncResults.syncTimes.average.toFixed(2),
      errors: syncResults.syncErrors,
    });
  } catch (error) {
    console.error(`Error sending the results email: ${error}`);
    emailBody = "FAILED TO GENERATE EMAIL BODY";
  }
  return sendEmail(recipientAddress, "IP Product Sync", emailBody);
}

export async function updateProductVariation(params: {
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  productId: number;
  variationId: number;
  stockQuantity?: number;
  price?: number;
  published?: boolean;
}): Promise<{ ok: boolean; status: number }> {
  const {
    productId,
    variationId,
    price,
    stockQuantity,
    published,
    apiKey,
    apiSecret,
    storeUrl,
  } = params;

  const bodyData: { [key: string]: number | string } = {};
  if (stockQuantity !== undefined) bodyData.stock_quantity = stockQuantity;
  if (price !== undefined) bodyData.regular_price = `${price}`;
  if (published !== undefined)
    bodyData.status = published ? "publish" : "private";

  try {
    const response = await fetch(
      `${storeUrl}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
      {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        },
      },
    );

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      status: INTERNAL_SERVER_ERROR,
    };
  }
}

export async function updateProduct(params: {
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  productId: number;
  stockQuantity?: number;
  price?: number;
  published?: boolean;
  sortOrder?: number;
}): Promise<{ ok: boolean; status: number }> {
  const {
    productId,
    price,
    stockQuantity,
    published,
    apiKey,
    apiSecret,
    storeUrl,
    sortOrder,
  } = params;

  const bodyData: { [key: string]: number | string } = {};
  if (stockQuantity !== undefined) bodyData.stock_quantity = stockQuantity;
  if (price !== undefined) bodyData.regular_price = `${price}`;
  if (published !== undefined)
    bodyData.status = published ? "publish" : "draft";
  if (sortOrder !== undefined) bodyData.menu_order = sortOrder;

  try {
    const response = await fetch(
      `${storeUrl}/wp-json/wc/v3/products/${productId}`,
      {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        },
      },
    );

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      status: INTERNAL_SERVER_ERROR,
    };
  }
}

export async function createProduct(params: {
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  name?: string;
  sku: string;
  type?: string;
  attributes?: { name: string; options: string[] }[];
}): Promise<{
  ok: boolean;
  status: number;
  message?: string;
  createdProduct?: WooCommerceProduct;
}> {
  const { apiKey, apiSecret, storeUrl, sku, type, name, attributes } = params;

  const attributesToUse = attributes
    ? attributes.map((item) => ({
        id: 0,
        name: item.name,
        options: item.options,
        visible: true,
        variation: true,
      }))
    : undefined;

  const body = {
    name: name || "New Product",
    sku,
    type: type || "simple",
    attributes: attributesToUse,
  };

  try {
    const response = await fetch(`${storeUrl}/wp-json/wc/v3/products`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: json.message || "No error message found",
      };
    }

    return {
      ok: true,
      status: OK,
      createdProduct: parseWooCommerceProduct(json),
    };
  } catch (error) {
    return {
      ok: false,
      status: INTERNAL_SERVER_ERROR,
    };
  }
}

export async function createProductVariation(params: {
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  sku: string;
  parentId: number;
  attributes: { name: string; option: string }[];
}): Promise<{
  ok: boolean;
  status: number;
  message?: string;
  createdId?: number;
}> {
  const { apiKey, apiSecret, storeUrl, sku, parentId, attributes } = params;

  const body = {
    sku,
    attributes,
  };

  console.log(inspect(body, true, null));

  try {
    const response = await fetch(
      `${storeUrl}/wp-json/wc/v3/products/${parentId}/variations`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        },
      },
    );

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: json.message || "No error message found",
      };
    }

    return {
      ok: true,
      status: OK,
      createdId: +`${json.id}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: INTERNAL_SERVER_ERROR,
    };
  }
}
