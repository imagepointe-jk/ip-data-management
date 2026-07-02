import { SyncRowData } from "@/components/SyncTable/SyncTable";
import { AppError } from "@/error";
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
        status: "error",
      },
    };

    const normalized = normalizeObjectKeys(item);
    const id = +`${normalized.id}`;
    if (isNaN(id)) {
      result.syncRowData.resultMessage = `Invalid ID at index ${i}`;
      return result;
    }

    const sortOrder =
      normalized.order !== undefined ? +`${normalized.order}` : undefined;
    if (sortOrder !== undefined && isNaN(sortOrder)) {
      result.syncRowData.resultMessage = `Invalid "order" value at index ${i}`;
      return result;
    }

    const stock =
      normalized.stock !== undefined ? +`${normalized.stock}` : undefined;
    if (stock !== undefined && isNaN(stock)) {
      result.syncRowData.resultMessage = `Invalid "stock" value at index ${i}`;
      return result;
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
      result.syncRowData.resultMessage = `Invalid "published" value at index ${i}`;
      return result;
    }

    const parent =
      normalized.parent !== undefined
        ? json.find((otherItem) => {
            const otherNormalized = normalizeObjectKeys(otherItem);
            return otherNormalized.sku === normalized.parent;
          })
        : undefined;

    if (normalized.parent !== undefined && parent === undefined) {
      result.syncRowData.resultMessage = `Unable to find parent of variation at index ${i}`;
      return result;
    }

    //if we get here, either there was no value provided for parent or a parent was found
    const parentId =
      parent !== undefined ? +`${normalizeObjectKeys(parent).id}` : undefined;
    if (parentId !== undefined && isNaN(parentId)) {
      result.syncRowData.resultMessage = `Parent of variation at index ${i} has invalid ID`;
      return result;
    }

    const sku = normalized.sku !== undefined ? `${normalized.sku}` : undefined;

    result.syncRowData.status = "ready";
    result.data = {
      id,
      sku,
      sortOrder,
      published,
      stock,
      parentId,
    };

    return result;
  });

  return parsed;
}

//this is here temporarily to avoid merge conflicts in src/app/fetch/client/woocommerce.ts
export async function getAllProducts(
  storeUrl: string,
  key: string,
  secret: string,
  includeVariations = true,
) {
  return fetch(
    `${storeUrl}/wp-json/wc/v3/products?per_page=100${includeVariations ? "&include_variations=true" : ""}`, //100 is max per page; we may need to do multiple requests for large stores
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${key}:${secret}`)}`,
      },
    },
  );
}
