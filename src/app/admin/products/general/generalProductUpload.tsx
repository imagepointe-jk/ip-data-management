import { AppError } from "@/error";
import {
  updateProduct,
  updateProductVariation,
} from "@/fetch/client/woocommerce";
import { validateGeneralProductSheet } from "@/types/validations/products";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

export type PendingSyncRow = {
  error?: {
    message: string;
  };
  data?: {
    id: number;
    parentId?: number;
    sku?: string;
    stock?: number;
  };
};
export type SyncRowResult = {
  id: number;
  sku: string;
  success: boolean;
  message: string;
};

export async function createPendingSyncRows(formData: FormData) {
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
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer));
  const json = sheetToJson(sheet);
  const parsed = validateGeneralProductSheet(json);
  const pendingRows: PendingSyncRow[] = parsed.map((item) => {
    const row: PendingSyncRow = {};
    if (!item.id || (!item.sku && !item.parent)) {
      row.error = { message: "SKU and/or ID missing" };
      return row;
    } else {
      const isVariation = item.parent !== undefined;
      const matchingParent = isVariation
        ? parsed.find((itemToCheck) => itemToCheck.sku === item.parent)
        : undefined;
      if (isVariation && !matchingParent) {
        row.error = {
          message: `No parent found for variation with parent SKU ${item.parent}`,
        };
        return row;
      } else {
        row.data = {
          id: item.id,
          sku: item.sku,
          parentId: matchingParent?.id,
          stock: item.stock,
        };
        return row;
      }
    }
  });

  return pendingRows;
}

export async function syncRow(params: {
  url: string;
  key: string;
  secret: string;
  row: PendingSyncRow;
}): Promise<SyncRowResult> {
  const { key, row, secret, url } = params;

  if (!row.data)
    return {
      id: 0,
      sku: "none",
      success: false,
      message: "No data",
    };

  const response = row.data.parentId
    ? await updateProductVariation({
        storeUrl: url,
        apiKey: key,
        apiSecret: secret,
        productId: row.data.parentId,
        variationId: row.data.id,
        stockQuantity: row.data.stock,
      })
    : await updateProduct({
        storeUrl: url,
        apiKey: key,
        apiSecret: secret,
        productId: row.data.id,
        stockQuantity: row.data.stock,
      });

  if (!response.ok)
    return {
      id: row.data.id,
      sku: row.data.sku || "<NO SKU>",
      message: `The API returned a ${response.status} status`,
      success: false,
    };

  return {
    id: row.data.id,
    sku: row.data.sku || "<NO SKU>",
    message: "Updated successfully",
    success: true,
  };
}
