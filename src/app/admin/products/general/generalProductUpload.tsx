import { SyncRowData } from "@/components/SyncTable/SyncTable";
import { AppError } from "@/error";
import {
  updateProduct,
  updateProductVariation,
} from "@/fetch/client/woocommerce";
import { normalizeObjectKeys } from "@/utility/misc";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { v4 as uuidv4 } from "uuid";

export type ProductSyncRow = {
  syncRowData: SyncRowData;
  data?: {
    id: number;
    parentId?: number;
    sku?: string;
    stock?: number;
    published?: boolean;
    sortOrder?: number;
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
      const id = validateId(normalized, i);
      const sortOrder = validateSortOrder(normalized, i);
      const stock = validateStock(normalized, i);
      const published = validatePublishedStatus(normalized, i);
      const parentId = validateParentId(normalized, i, json);
      const sku =
        normalized.sku !== undefined ? `${normalized.sku}` : undefined;

      result.syncRowData.status = "ready";
      result.data = {
        id,
        sku,
        sortOrder,
        published,
        stock,
        parentId,
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

function validateId(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  const id = +`${normalizedInputObject.id}`;
  if (isNaN(id)) throw new Error(`Invalid ID at index ${rowIndex}`);

  return id;
}

function validateSortOrder(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  const sortOrder =
    normalizedInputObject.order !== undefined
      ? +`${normalizedInputObject.order}`
      : undefined;
  if (sortOrder !== undefined && isNaN(sortOrder))
    throw new Error(`Invalid "order" value at index ${rowIndex}`);

  return sortOrder;
}

function validateStock(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  const stock =
    normalizedInputObject.stock !== undefined
      ? +`${normalizedInputObject.stock}`
      : undefined;
  if (stock !== undefined && isNaN(stock))
    throw new Error(`Invalid "stock" value at index ${rowIndex}`);

  return stock;
}

function validatePublishedStatus(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  const published =
    normalizedInputObject.published === undefined
      ? undefined
      : normalizedInputObject.published === "y"
        ? true
        : false;
  if (
    normalizedInputObject.published !== undefined &&
    !["y", "n"].includes(normalizedInputObject.published)
  )
    throw new Error(`Invalid "published" value at index ${rowIndex}`);

  return published;
}

function validateParentId(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
  fullSheetJson: any[],
) {
  const parent =
    normalizedInputObject.parent !== undefined
      ? fullSheetJson.find((otherItem) => {
          const otherNormalized = normalizeObjectKeys(otherItem);
          return otherNormalized.sku === normalizedInputObject.parent;
        })
      : undefined;

  if (normalizedInputObject.parent !== undefined && parent === undefined)
    throw new Error(`Unable to find parent of variation at index ${rowIndex}`);

  //if we get here, either there was no value provided for parent or a parent was found
  const parentId =
    parent !== undefined ? +`${normalizeObjectKeys(parent).id}` : undefined;
  if (parentId !== undefined && isNaN(parentId))
    throw new Error(`Parent of variation at index ${rowIndex} has invalid ID`);

  return parentId;
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

  const { parentId, id, stock, published, sortOrder, sku } = data;
  result.id = id;
  if (sku) result.sku = sku;
  const isVariation = parentId !== undefined;

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

  return result;
}
