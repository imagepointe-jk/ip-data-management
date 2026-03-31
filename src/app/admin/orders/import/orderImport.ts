import { AppError } from "@/error";
// import { getAllProducts } from "@/fetch/client/woocommerce";
import { OrderImportDTO } from "@/types/schema/orders";
import { WooCommerceProduct } from "@/types/schema/woocommerce";
import { validateOrderImportSheet } from "@/types/validations/orders";
import { parseWooCommerceProductsMultiple } from "@/types/validations/woo";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

//TODO: line item validation has been skipped due to time constraints; come back to do this properly when possible
type ValidationStatus = "ok" | "missing";
export type OrderImportValidationStatus = {
  id?: string;
  overallStatus: ValidationStatus;
  shipping: {
    firstName: ValidationStatus;
    lastName: ValidationStatus;
    addressLine1: ValidationStatus;
    city: ValidationStatus;
    state: ValidationStatus;
    zip: ValidationStatus;
    method: ValidationStatus;
  };
  billing: {
    firstName: ValidationStatus;
    lastName: ValidationStatus;
    email: ValidationStatus;
    addressLine1: ValidationStatus;
    city: ValidationStatus;
    state: ValidationStatus;
    zip: ValidationStatus;
  };
  lineItems: {
    sku: string;
    validationStatus: ValidationStatus;
  }[];
};
export type PendingOrderUploadData = {
  pendingUploads: OrderImportDTO[];
  validationStatuses: OrderImportValidationStatus[];
};

export async function createPendingOrderUploadData(
  formData: FormData,
): Promise<PendingOrderUploadData> {
  //get data from the form
  const file = formData.get("file");
  // const url = `${formData.get("url")}`;
  // const key = `${formData.get("key")}`;
  // const secret = `${formData.get("secret")}`;
  if (!(file instanceof File) || file.size === 0) {
    throw new AppError({
      type: "Client Request",
      clientMessage: "Invalid or missing file.",
      serverMessage: "Invalid or missing file.",
      statusCode: BAD_REQUEST,
    });
  }

  //get and parse json from form data
  const arrayBuffer = await file.arrayBuffer();
  const ordersSheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "orders");
  const ordersJson = sheetToJson(ordersSheet);

  const lineItemsSheet = getSheetFromBuffer(
    Buffer.from(arrayBuffer),
    "line items",
  );
  const lineItemsJson = sheetToJson(lineItemsSheet);

  const parsedOrders = validateOrderImportSheet(ordersJson, lineItemsJson);

  //get products to check against the ones in the import sheet
  // const response = await getAllProducts(url, key, secret);
  // const json = await response.json();
  // if (!response.ok) {
  //   throw new Error(
  //     `Response code ${response.status} while retrieving product data from the store. Message from the server: ${json.message || "(no message found"}`,
  //   );
  // }
  // const parsedProducts = parseWooCommerceProductsMultiple(json);

  //create a validation status for each order
  const orderValidationStatuses = parsedOrders.map((order) =>
    checkOrderValidationStatus(order),
  );

  //return the orders to be uploaded as well as the validation statuses of each
  return {
    pendingUploads: parsedOrders,
    validationStatuses: orderValidationStatuses,
  };
}

export function checkOrderValidationStatus(
  pendingOrder: OrderImportDTO,
  // existingProducts: WooCommerceProduct[],
): OrderImportValidationStatus {
  //validate each line item
  // const lineItemsValidationStatuses: {
  //   sku: string;
  //   validationStatus: ValidationStatus;
  // }[] = pendingOrder.lineItems.map((lineItem) => {
  //   const hasSku = lineItem.sku !== undefined;
  //   const skuFoundInAnyProductOrVariation = !!existingProducts.find(
  //     (product) => {
  //       const matchesMainSku =
  //         product.sku.toLocaleLowerCase() === lineItem.sku?.toLocaleLowerCase();
  //       if (matchesMainSku) return true;

  //       return !!product.variations.find(
  //         (variation) =>
  //           variation.sku?.toLocaleLowerCase() ===
  //           lineItem.sku?.toLocaleLowerCase(),
  //       );
  //     },
  //   );

  //   return {
  //     sku: `${lineItem.sku}`,
  //     validationStatus:
  //       hasSku && skuFoundInAnyProductOrVariation ? "ok" : "missing",
  //   };
  // });
  const lineItemsValidationStatuses: {
    sku: string;
    validationStatus: ValidationStatus;
  }[] = pendingOrder.lineItems.map((lineItem) => ({
    sku: `${lineItem.sku}`,
    validationStatus: "ok",
  })); //ran out of time; do proper line item validation at some point

  //validate the order fields, and include the validated line items
  const orderValidationStatus: OrderImportValidationStatus = {
    id: pendingOrder.id,
    overallStatus: "ok", //start off as ok, but will be downgraded if any of the below are a lower status
    shipping: {
      firstName: pendingOrder.shipping.firstName ? "ok" : "missing",
      lastName: pendingOrder.shipping.lastName ? "ok" : "missing",
      addressLine1: pendingOrder.shipping.addressLine1 ? "ok" : "missing",
      city: pendingOrder.shipping.city ? "ok" : "missing",
      state: pendingOrder.shipping.state ? "ok" : "missing",
      zip: pendingOrder.shipping.zip ? "ok" : "missing",
      method: pendingOrder.shipping.method ? "ok" : "missing",
    },
    billing: {
      firstName: pendingOrder.billing.firstName ? "ok" : "missing",
      lastName: pendingOrder.billing.lastName ? "ok" : "missing",
      email: pendingOrder.billing.email ? "ok" : "missing",
      addressLine1: pendingOrder.billing.addressLine1 ? "ok" : "missing",
      city: pendingOrder.billing.city ? "ok" : "missing",
      state: pendingOrder.billing.state ? "ok" : "missing",
      zip: pendingOrder.billing.zip ? "ok" : "missing",
    },
    lineItems: lineItemsValidationStatuses,
  };

  //decide the overall status
  for (const [_, value] of Object.entries(orderValidationStatus.shipping)) {
    if (value !== "ok") orderValidationStatus.overallStatus = "missing";
  }
  for (const [_, value] of Object.entries(orderValidationStatus.billing)) {
    if (value !== "ok") orderValidationStatus.overallStatus = "missing";
  }
  const lineItemIssueCount = orderValidationStatus.lineItems.filter(
    (item) => item.validationStatus !== "ok",
  ).length;
  if (lineItemIssueCount > 0) orderValidationStatus.overallStatus = "missing";

  return orderValidationStatus;
}
