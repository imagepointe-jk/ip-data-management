import {
  createProduct,
  updateProduct,
  updateProductVariation,
} from "@/actions/products/products";
import { SyncRowData } from "@/components/SyncTable/SyncTable";
import { validateSyncRowOperation } from "@/components/SyncTable/validation";
import { AppError } from "@/error";
import { normalizeObjectKeys } from "@/utility/misc";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { v4 as uuidv4 } from "uuid";
import {
  validateId,
  validateParentId,
  validateProductType,
  validatePublishedStatus,
  validateSku,
  validateSortOrder,
  validateStock,
} from "./validation";

export type ProductSyncRow = {
  syncRowData: SyncRowData;
  data?: {
    id: number;
    parentId?: number;
    name?: string;
    sku?: string;
    stock?: number;
    published?: boolean;
    sortOrder?: number;
    type?: string;
  };
};
type ProductSyncRowResult = {
  rowId: string;
  id: number;
  sku: string;
  success: boolean;
  message: string;
};

export async function createProductSyncRows(
  formData: FormData,
): Promise<ProductSyncRow[]> {
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

  return parsed;
}

function validateGeneralProductSheet(json: any): ProductSyncRow[] {
  if (!Array.isArray(json)) throw new Error("Not an array");

  const parsed: ProductSyncRow[] = json.map((item, i) => {
    const rowId = uuidv4();
    const result: ProductSyncRow = {
      syncRowData: {
        rowId,
        status: "invalid",
      },
    };

    const normalized = normalizeObjectKeys(item);
    try {
      const operation = validateSyncRowOperation(normalized, i);
      const id = validateId(normalized, operation, i);
      const sortOrder = validateSortOrder(normalized, i);
      const stock = validateStock(normalized, i);
      const published = validatePublishedStatus(normalized, i);
      const parentId = validateParentId(normalized, i, json);
      const sku = validateSku(normalized, operation, i);
      const name =
        normalized.name === undefined ? undefined : `${normalized.name}`;
      const type = validateProductType(normalized, i);

      result.syncRowData.status = "ready";
      result.syncRowData.operation = operation;
      result.data = {
        id,
        sku,
        name,
        sortOrder,
        published,
        stock,
        parentId,
        type,
      };
    } catch (error) {
      if (error instanceof Error) {
        result.syncRowData.resultMessage = error.message;
      } else {
        result.syncRowData.resultMessage = "UNKNOWN VALIDATION ERROR";
      }
    }

    return result;
  });

  return parsed;
}

export async function syncRow(params: {
  url: string;
  key: string;
  secret: string;
  row: ProductSyncRow;
}): Promise<ProductSyncRowResult> {
  const {
    key,
    row: { syncRowData, data },
    secret,
    url,
  } = params;
  const result: ProductSyncRowResult = {
    id: 0,
    message: "No data",
    rowId: syncRowData.rowId,
    success: false,
    sku: "<NO SKU>",
  };

  if (!data) return result;

  const { parentId, id, stock, published, sortOrder, sku, name, type } = data;
  result.id = id;
  if (sku) result.sku = sku;
  const isVariation = parentId !== undefined;

  if (syncRowData.operation == "create") {
    const response = await createProduct({
      storeUrl: url,
      apiKey: key,
      apiSecret: secret,
      sku: `${sku}`,
      name,
      type,
    });
    if (!response.ok) {
      result.message = `The API returned a ${response.status} status`;
    } else {
      result.message = "";
      result.success = true;
    }
  } else {
    const response = isVariation
      ? await updateProductVariation({
          storeUrl: url,
          apiKey: key,
          apiSecret: secret,
          productId: parentId,
          variationId: id,
          stockQuantity: stock,
          published,
        })
      : await updateProduct({
          storeUrl: url,
          apiKey: key,
          apiSecret: secret,
          productId: id,
          stockQuantity: stock,
          published,
          sortOrder,
        });
    if (!response.ok) {
      result.message = `The API returned a ${response.status} status`;
    } else {
      result.message = "";
      result.success = true;
    }
  }

  return result;
}
