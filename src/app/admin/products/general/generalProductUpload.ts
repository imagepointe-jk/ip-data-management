import {
  createProduct,
  createProductVariation,
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
  validateCostOfGood,
  validateId,
  validateLowStockAmount,
  validateManageStock,
  validateProductType,
  validatePublishedStatus,
  validateRetailPrice,
  validateSku,
  validateSortOrder,
  validateStock,
  validateTaxClass,
  validateWeight,
} from "./validation";
import { getAllProducts } from "@/fetch/client/woocommerce";
import { parseWooCommerceProductsMultiple } from "@/types/validations/woo";
import { WooCommerceProduct } from "@/types/schema/woocommerce";

export type ProductSyncRow = {
  syncRowData: SyncRowData;
  data?: {
    id: number;
    parentSku?: string;
    name?: string;
    sku?: string;
    description?: string;
    retailPrice?: number;
    costOfGood?: number;
    stock?: number;
    lowStockAmount?: number;
    manageStock?: boolean;
    weight?: number;
    taxClass?: string;
    published?: boolean;
    sortOrder?: number;
    type?: string;
    color?: string;
    size?: string;
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
      const lowStockAmount = validateLowStockAmount(normalized, i);
      const published = validatePublishedStatus(normalized, i);
      const description =
        normalized.description === undefined
          ? undefined
          : `${normalized.description}`;
      const retailPrice = validateRetailPrice(normalized, i);
      const costOfGood = validateCostOfGood(normalized, i);
      const weight = validateWeight(normalized, i);
      const manageStock = validateManageStock(normalized, i);
      const taxClass = validateTaxClass(normalized, i);
      const sku = validateSku(normalized, operation, i);
      const name =
        normalized.name === undefined ? undefined : `${normalized.name}`;
      const parentSku =
        normalized.parent === undefined ? undefined : `${normalized.parent}`;
      const color =
        normalized.color === undefined ? undefined : `${normalized.color}`;
      const size =
        normalized.size === undefined ? undefined : `${normalized.size}`;
      const type = validateProductType(normalized, i);

      result.syncRowData.status = "ready";
      result.syncRowData.operation = operation;
      result.data = {
        id,
        sku,
        name,
        description,
        retailPrice,
        costOfGood,
        sortOrder,
        published,
        stock,
        lowStockAmount,
        manageStock,
        taxClass,
        weight,
        parentSku,
        type,
        color,
        size,
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
  allRows: ProductSyncRow[];
  serverContext: WooCommerceProduct[];
}): Promise<ProductSyncRowResult> {
  const { key, row, secret, url, allRows, serverContext } = params;
  const result: ProductSyncRowResult = {
    id: 0,
    message: "No data",
    rowId: row.syncRowData.rowId,
    success: false,
    sku: "<NO SKU>",
  };

  if (!row.data) return result;

  const { sku } = row.data;
  result.id = row.data.id;
  if (sku) result.sku = sku;

  if (row.syncRowData.operation == "create") {
    await handleCreationSyncRow({
      url,
      key,
      secret,
      row,
      allRows,
      resultContext: result,
      serverContext,
    });
  } else {
    await handleUpdateSyncRow({
      url,
      key,
      secret,
      row,
      resultContext: result,
      serverContext,
    });
  }

  return result;
}

async function handleCreationSyncRow(params: {
  url: string;
  key: string;
  secret: string;
  row: ProductSyncRow;
  allRows: ProductSyncRow[];
  serverContext: WooCommerceProduct[];
  resultContext: ProductSyncRowResult;
}) {
  const {
    key,
    row: { data },
    secret,
    url,
    allRows,
    resultContext,
    serverContext,
  } = params;
  if (!data) return;

  const {
    parentSku,
    sku,
    name,
    type,
    color,
    size,
    costOfGood,
    description,
    lowStockAmount,
    manageStock,
    published,
    retailPrice,
    sortOrder,
    stock,
    taxClass,
    weight,
  } = data;
  const isVariation = parentSku !== undefined;
  let response: {
    ok: boolean;
    status: number;
    message?: string;
    createdProduct?: WooCommerceProduct;
  } = {
    ok: false,
    status: 0,
  };

  if (isVariation) {
    const parent = serverContext.find(
      (product) =>
        product.sku.toLocaleLowerCase() === parentSku.toLocaleLowerCase(),
    );
    if (!parent) {
      resultContext.message = `Can't create variation ${sku} because no parent product with sku ${parentSku} was found on the server.`;
      return;
    }

    response = await createProductVariation({
      storeUrl: url,
      apiKey: key,
      apiSecret: secret,
      sku: `${sku}`,
      attributes: createVariationAttributesArray({ color, size }),
      parentId: parent.id,
    });
  } else {
    const attributesArray = createParentAttributesArray({
      sku: `${sku}`,
      allRows,
    });
    response = await createProduct({
      storeUrl: url,
      apiKey: key,
      apiSecret: secret,
      sku: `${sku}`,
      name,
      type,
      costOfGood,
      description,
      lowStockAmount,
      manageStock,
      published,
      retailPrice,
      sortOrder,
      stock,
      taxClass,
      weight,
      attributes: attributesArray,
    });
    const { createdProduct } = response;
    if (createdProduct) {
      serverContext.push(createdProduct);
    }
  }

  if (!response.ok) {
    resultContext.message = `The API returned a ${response.status} status. Message: ${response.message}`;
  } else {
    resultContext.success = true;
  }
}

async function handleUpdateSyncRow(params: {
  url: string;
  key: string;
  secret: string;
  row: ProductSyncRow;
  serverContext: WooCommerceProduct[];
  resultContext: ProductSyncRowResult;
}) {
  const {
    key,
    row: { data },
    secret,
    url,
    resultContext,
    serverContext,
  } = params;
  if (!data) return;

  const { parentSku, sku, id, stock, published, sortOrder } = data;
  const isVariation = parentSku !== undefined;
  let response: {
    ok: boolean;
    status: number;
    message?: string;
    createdId?: number;
  } = {
    ok: false,
    status: 0,
  };

  if (isVariation) {
    const parent = serverContext.find(
      (product) =>
        product.sku.toLocaleLowerCase() === parentSku.toLocaleLowerCase(),
    );
    if (!parent) {
      resultContext.message = `Can't create variation ${sku} because no parent product with sku ${parentSku} was found on the server.`;
      return;
    }

    response = await updateProductVariation({
      storeUrl: url,
      apiKey: key,
      apiSecret: secret,
      productId: parent.id,
      variationId: id,
      stockQuantity: stock,
      published,
    });
  } else {
    response = await updateProduct({
      storeUrl: url,
      apiKey: key,
      apiSecret: secret,
      productId: id,
      stockQuantity: stock,
      published,
      sortOrder,
    });
  }

  if (!response.ok) {
    resultContext.message = `The API returned a ${response.status} status. Message: ${response.message}`;
  } else {
    resultContext.success = true;
  }
}

export async function getServerContext(params: {
  url: string;
  key: string;
  secret: string;
}) {
  const { key, secret, url } = params;
  const response = await getAllProducts(url, key, secret);
  if (!response.ok) {
    throw new Error("Failed to get server context");
  }

  const json = await response.json();
  return parseWooCommerceProductsMultiple(json);
}

//figure out what attributes a parent product should have by looking through the sizes and colors of any children that might be in the sync rows
function createParentAttributesArray(params: {
  sku: string;
  allRows: ProductSyncRow[];
}) {
  const { allRows, sku } = params;
  const attributes: { name: string; options: string[] }[] = [];

  for (const row of allRows) {
    const { data } = row;
    if (
      !data ||
      data.parentSku?.toLocaleLowerCase() !== sku.toLocaleLowerCase()
    )
      continue;
    const { size, color } = data;

    if (size) {
      const existingSizeAttribute = attributes.find(
        (item) => item.name.toLocaleLowerCase() === "size",
      );

      if (!existingSizeAttribute) {
        attributes.push({ name: "Size", options: [size] });
      } else {
        if (!existingSizeAttribute.options.includes(size))
          existingSizeAttribute.options.push(size);
      }
    }

    if (color) {
      const existingColorAttribute = attributes.find(
        (item) => item.name.toLocaleLowerCase() === "color",
      );

      if (!existingColorAttribute) {
        attributes.push({ name: "Color", options: [color] });
      } else {
        if (!existingColorAttribute.options.includes(color))
          existingColorAttribute.options.push(color);
      }
    }
  }

  return attributes;
}

function createVariationAttributesArray(params: {
  color?: string;
  size?: string;
}) {
  const { color, size } = params;
  const arr: { id: number; name: string; slug: string; option: string }[] = [];

  if (color) {
    arr.push({ id: 0, name: "Color", slug: "Color", option: color });
  }
  if (size) {
    arr.push({ id: 0, name: "Size", slug: "Size", option: size });
  }

  return arr;
}
