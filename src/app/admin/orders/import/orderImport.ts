import { AppError } from "@/error";
import { OrderImportDTO } from "@/types/schema/orders";
import { validateOrderImportSheet } from "@/types/validations/orders";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

type ValidationStatus = "ok" | "missing";

export async function createPendingOrderUploads(
  formData: FormData,
): Promise<OrderImportDTO[]> {
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

  const ordersSheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "orders");
  const ordersJson = sheetToJson(ordersSheet);

  const lineItemsSheet = getSheetFromBuffer(
    Buffer.from(arrayBuffer),
    "line items",
  );
  const lineItemsJson = sheetToJson(lineItemsSheet);

  const parsed = validateOrderImportSheet(ordersJson, lineItemsJson);

  return parsed;
}

export function checkOrderValidationStatus(
  pendingOrder: OrderImportDTO,
): ValidationStatus {
  if (!pendingOrder.shipping.firstName) return "missing";
  if (!pendingOrder.shipping.lastName) return "missing";
  if (!pendingOrder.shipping.addressLine1) return "missing";
  if (!pendingOrder.shipping.city) return "missing";
  if (!pendingOrder.shipping.state) return "missing";
  if (!pendingOrder.shipping.zip) return "missing";
  if (!pendingOrder.shipping.method) return "missing";

  if (!pendingOrder.billing.firstName) return "missing";
  if (!pendingOrder.billing.lastName) return "missing";
  if (!pendingOrder.billing.email) return "missing";
  if (!pendingOrder.billing.addressLine1) return "missing";
  if (!pendingOrder.billing.city) return "missing";
  if (!pendingOrder.billing.state) return "missing";
  if (!pendingOrder.billing.zip) return "missing";

  if (pendingOrder.lineItems.length === 0) return "missing";

  return "ok";
}
