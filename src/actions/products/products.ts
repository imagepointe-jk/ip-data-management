"use server";

import { AppError } from "@/error";
import { searchIPProducts, updateIPProduct } from "@/fetch/woocommerce";
import { ASIProductImportData } from "@/types/schema/products";
import { validateASIProducts } from "@/types/validations/products";
import { getSheetFromBuffer } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

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
  console.log("WooCommerce product sync initiated.");
  runSync(parsed);
}

async function runSync(productData: ASIProductImportData[]) {
  for (let i = 0; i < productData.length; i++) {
    const data = productData[i]!;
    try {
      console.log(
        `Syncing SKU ${data.sku} (${i + 1} of ${productData.length})...`
      );
      const searchResponse = await searchIPProducts(data.sku);
      if (!searchResponse.ok)
        throw new Error(
          `Search for the product returned a ${searchResponse.status} status`
        );

      const searchJson = await searchResponse.json();
      const firstResult = searchJson[0];
      if (!firstResult || firstResult.sku !== data.sku)
        throw new Error(
          `Couldn't find product with SKU ${data.sku} in the database`
        );

      const updateResponse = await updateIPProduct(+firstResult.id, {
        priceBreaks: {
          break1: data.priceBreaks[0],
          break2: data.priceBreaks[1],
          break3: data.priceBreaks[2],
          break4: data.priceBreaks[3],
          break5: data.priceBreaks[4],
        },
      });
      if (!updateResponse.ok)
        throw new Error(
          `The update request returned a ${updateResponse.status} status`
        );
    } catch (error) {
      console.error(`Failed to sync SKU ${data.sku}: ${error}`);
    }
  }

  console.log("Sync process complete.");
}
