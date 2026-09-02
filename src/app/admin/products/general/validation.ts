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
  return validateNumberFromAny(
    normalizedInputObject.order,
    `Invalid "order" value at index ${rowIndex}`,
  );
}

export function validateStock(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateNumberFromAny(
    normalizedInputObject.stock,
    `Invalid "stock" value at index ${rowIndex}`,
  );
}

export function validatePublishedStatus(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateYesOrNo(
    normalizedInputObject.published,
    `Invalid "published" value at index ${rowIndex}`,
  );
}

export function validateManageStock(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateYesOrNo(
    normalizedInputObject["stock tracking"],
    `Invalid "stock tracking" value at index ${rowIndex}`,
  );
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

export function validateRetailPrice(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateNumberFromAny(
    normalizedInputObject["retail price"],
    `Invalid "retail price" value at index ${rowIndex}`,
  );
}

export function validateCostOfGood(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateNumberFromAny(
    normalizedInputObject["cost of good"],
    `Invalid "cost of good" value at index ${rowIndex}`,
  );
}

export function validateLowStockAmount(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateNumberFromAny(
    normalizedInputObject["low stock amount"],
    `Invalid "low stock amount" value at index ${rowIndex}`,
  );
}

export function validateWeight(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  return validateNumberFromAny(
    normalizedInputObject.weight,
    `Invalid "weight" value at index ${rowIndex}`,
  );
}

export function validateTaxClass(
  normalizedInputObject: { [key: string]: any },
  rowIndex: number,
) {
  const taxClass =
    normalizedInputObject["tax class"] === undefined
      ? undefined
      : `${normalizedInputObject["tax class"]}`;
  if (taxClass !== undefined && !["standard", "clothing"].includes(taxClass))
    throw new Error(`Invalid "tax class" value at index ${rowIndex}`);

  return taxClass;
}

function validateYesOrNo(val: any, messageIfError: string) {
  const asBool = val === undefined ? undefined : val === "y" ? true : false;
  if (val !== undefined && !["y", "n"].includes(val))
    throw new Error(messageIfError);

  return asBool;
}

function validateNumberFromAny(val: any, messageIfError: string) {
  const asNum = val !== undefined ? +`${val}` : undefined;
  if (val !== undefined && isNaN(val)) throw new Error(messageIfError);

  return asNum;
}
