"use server";

import { env } from "@/env";
import { AppError } from "@/error";
import { SyncDataCache } from "@/types/schema/dignity-apparel";
import { validateStockImportData } from "@/types/validations/dignity-apparel";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";
import { createClient, RedisClientType } from "redis";

export async function uploadSyncData(formData: FormData) {
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
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "Woo_Import");
  const json = sheetToJson(sheet);
  const validated = validateStockImportData(json);

  const cacheData: SyncDataCache = {
    updatedAt: new Date(),
    importRows: validated.parsed,
  };

  const client = await createClient({
    url: env.REDIS_URL,
  })
    .on("error", (err) => {
      throw new AppError({
        type: "Database",
        clientMessage: `Redis error: ${err}`,
        serverMessage: `Redis error: ${err}`,
        statusCode: INTERNAL_SERVER_ERROR,
      });
    })
    .connect();

  const twoDays = 60 * 60 * 24 * 2;
  await client.setEx(
    env.REDIS_DA_INVENTORY_SYNC_CACHE_KEY,
    twoDays,
    JSON.stringify(cacheData)
  );
}
