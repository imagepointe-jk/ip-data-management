import { AppError } from "@/error";
import {
  updateProduct,
  updateProductVariation,
} from "@/fetch/client/woocommerce";
import { normalizeObjectKeys } from "@/utility/misc";
// import { validateGeneralProductSheet } from "@/types/validations/products";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { v4 as uuidv4 } from "uuid";

export type ProductSyncRow = {
  rowId: string;
  error?: {
    message: string;
  };
  data?: {
    id: number;
    parentId?: number;
    sku?: string;
    stock?: number;
    published?: boolean;
    sortOrder?: number;
  };
};
export type ProductSyncRowResult = {
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
  // const pendingRows: PendingSyncRow[] = parsed.map((item) => {
  //   const row: PendingSyncRow = {};
  //   if (!item.id || (!item.sku && !item.parent)) {
  //     row.error = { message: "SKU and/or ID missing" };
  //     return row;
  //   } else {
  //     const isVariation = item.parent !== undefined;
  //     const matchingParent = isVariation
  //       ? parsed.find((itemToCheck) => itemToCheck.sku === item.parent)
  //       : undefined;
  //     if (isVariation && !matchingParent) {
  //       row.error = {
  //         message: `No parent found for variation with parent SKU ${item.parent}`,
  //       };
  //       return row;
  //     } else {
  //       row.data = {
  //         id: item.id,
  //         sku: item.sku,
  //         parentId: matchingParent?.id,
  //         stock: item.stock,
  //         published: item.published,
  //         sortOrder: item.order,
  //       };
  //       return row;
  //     }
  //   }
  // });

  return parsed;
}

function validateGeneralProductSheet(json: any): ProductSyncRow[] {
  if (!Array.isArray(json)) throw new Error("Not an array");

  const parsed: ProductSyncRow[] = json.map((item, i) => {
    const rowId = uuidv4();
    const normalized = normalizeObjectKeys(item);
    const id = +`${normalized.id}`;
    if (isNaN(id)) {
      return {
        rowId,
        error: {
          message: `Invalid ID at index ${i}`,
        },
      };
    }

    const sortOrder =
      normalized.order !== undefined ? +`${normalized.order}` : undefined;
    if (sortOrder !== undefined && isNaN(sortOrder)) {
      return {
        rowId,
        error: {
          message: `Invalid "order" value at index ${i}`,
        },
      };
    }

    const stock =
      normalized.stock !== undefined ? +`${normalized.stock}` : undefined;
    if (stock !== undefined && isNaN(stock)) {
      return {
        rowId,
        error: {
          message: `Invalid "stock" value at index ${i}`,
        },
      };
    }

    const published =
      normalized.published === undefined
        ? undefined
        : normalized.published === "y"
          ? true
          : false;
    if (
      normalized.published !== undefined &&
      !["y", "n"].includes(normalized.published)
    ) {
      return {
        rowId,
        error: {
          message: `Invalid "published" value at index ${i}`,
        },
      };
    }

    const parent =
      normalized.parent !== undefined
        ? json.find((otherItem) => {
            const otherNormalized = normalizeObjectKeys(otherItem);
            return otherNormalized.sku === normalized.parent;
          })
        : undefined;

    if (normalized.parent !== undefined && parent === undefined) {
      return {
        rowId,
        error: {
          message: `Unable to find parent of variation at index ${i}`,
        },
      };
    }

    //if we get here, either there was no value provided for parent or a parent was found
    const parentId =
      parent !== undefined ? +`${normalizeObjectKeys(parent).id}` : undefined;
    if (parentId !== undefined && isNaN(parentId)) {
      return {
        rowId,
        error: {
          message: `Parent of variation at index ${i} has invalid ID`,
        },
      };
    }

    const sku = normalized.sku !== undefined ? `${normalized.sku}` : undefined;

    const parsedItem: ProductSyncRow = {
      rowId,
      data: {
        id,
        sku,
        sortOrder,
        published,
        stock,
        parentId,
      },
    };

    return parsedItem;
  });

  return parsed;
}

export async function syncRow(params: {
  url: string;
  key: string;
  secret: string;
  row: ProductSyncRow;
}): Promise<ProductSyncRowResult> {
  const { key, row, secret, url } = params;

  if (!row.data)
    return {
      rowId: row.rowId,
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
        published: row.data.published,
      })
    : await updateProduct({
        storeUrl: url,
        apiKey: key,
        apiSecret: secret,
        productId: row.data.id,
        stockQuantity: row.data.stock,
        published: row.data.published,
        sortOrder: row.data.sortOrder,
      });

  if (!response.ok)
    return {
      rowId: row.rowId,
      id: row.data.id,
      sku: row.data.sku || "<NO SKU>",
      message: `The API returned a ${response.status} status`,
      success: false,
    };

  return {
    rowId: row.rowId,
    id: row.data.id,
    sku: row.data.sku || "<NO SKU>",
    message: "Updated successfully",
    success: true,
  };
}
