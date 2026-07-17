import { normalizeObjectKeys } from "@/utility/misc";

export function validateSyncRowOperation(
  rowRaw: any,
  rowIndex?: number,
): "update" | "create" {
  const normalized = normalizeObjectKeys(rowRaw);
  if (`${normalized.operation}`.toLocaleLowerCase() === "update")
    return "update";
  if (`${normalized.operation}`.toLocaleLowerCase() === "create")
    return "create";

  throw new Error(
    `Invalid "operation" value at index ${rowIndex !== undefined ? rowIndex : "UNKNOWN"}`,
  );
}
