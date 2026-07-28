import { SyncRowOperation } from "@/components/SyncTable/SyncTable";
import { normalizeObjectKeys } from "@/utility/misc";

export function validateId(
  normalizedInputObject: { [key: string]: any },
  syncRowOperation: SyncRowOperation,
  rowIndex: number,
) {
  const id = +`${normalizedInputObject.id}`;
  if (isNaN(id) && syncRowOperation === "update")
    throw new Error(`Invalid ID at index ${rowIndex}`);

  return id;
}

export function validateSortOrder(
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

export function validateStock(
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

export function validatePublishedStatus(
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

export function validateParentId(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
  fullSheetJson: any[],
) {
  const parentSKU =
    typeof normalizedInputObject.parent === "string"
      ? `${normalizedInputObject.parent}`
      : undefined;
  if (parentSKU === undefined) return undefined; //no parent SKU given, so no parent ID to look for

  const parent = fullSheetJson.find((otherItem) => {
    const otherNormalized = normalizeObjectKeys(otherItem);
    return otherNormalized.sku === parentSKU;
  });

  if (parent === undefined)
    throw new Error(`Unable to find parent of variation at index ${rowIndex}`);

  //if we get here, a parent was found
  const normalizedParent = normalizeObjectKeys(parent);
  if (normalizedParent.operation === "create") return undefined; //we're creating the parent during this import, so it won't have an ID yet (and we don't need it to)

  const parentId = +`${normalizedParent.id}`;
  if (isNaN(parentId))
    throw new Error(`Parent of variation at index ${rowIndex} has invalid ID`);

  return parentId;
}

export function validateProductType(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
): string | undefined {
  const type = normalizedInputObject.type;

  if (!["simple", "variable", undefined].includes(type)) {
    throw new Error(`Invalid "type" value at index ${rowIndex}`);
  }

  return type;
}

export function validateSku(
  normalizedInputObject: { [key: string]: any },
  syncRowOperation: SyncRowOperation,
  rowIndex: number,
): string | undefined {
  const sku =
    normalizedInputObject.sku === undefined
      ? undefined
      : `${normalizedInputObject.sku}`;
  if (syncRowOperation === "update") {
    return sku; //if the product is being updated, we don't necessarily need the sku, because only the ID is required
  }

  if (sku === undefined)
    throw new Error(
      `No SKU provided at index ${rowIndex} (required for product creation)`,
    );

  return sku;
}
