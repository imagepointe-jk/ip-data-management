import { normalizeObjectKeys } from "@/utility/misc";
import { orderImportSchema } from "../schema/orders";
import { z } from "zod";

function maybeStringified(input?: string) {
  return input ? `${input}` : undefined;
}

export function validateOrderImportSheet(ordersJson: any, lineItemsJson: any) {
  if (!Array.isArray(ordersJson)) throw new Error("Orders is not an array");
  if (!Array.isArray(lineItemsJson))
    throw new Error("Line Items is not an array");

  const normalizedOrderRows = ordersJson.map((row) => normalizeObjectKeys(row));
  const normalizedLineItemRows = lineItemsJson.map((row) =>
    normalizeObjectKeys(row),
  );

  const toBeParsed = normalizedOrderRows.map((orderRow) => ({
    id: maybeStringified(orderRow["import id"]),
    shipping: {
      firstName: orderRow["shipping first name"],
      lastName: orderRow["shipping last name"],
      addressLine1: orderRow["shipping address line 1"],
      addressLine2: orderRow["shipping address line 2"],
      city: orderRow["shipping city"],
      state: orderRow["shipping state"],
      zip: maybeStringified(orderRow["shipping zip code"]),
      country: orderRow["shipping country"],
      method: maybeStringified(orderRow["shipping method id"]),
    },
    billing: {
      firstName: orderRow["billing first name"],
      lastName: orderRow["billing last name"],
      email: orderRow["billing email"],
      phone: maybeStringified(orderRow["billing phone"]),
      addressLine1: orderRow["billing address line 1"],
      addressLine2: orderRow["billing address line 2"],
      city: orderRow["billing city"],
      state: orderRow["billing state"],
      zip: maybeStringified(orderRow["billing zip code"]),
      country: orderRow["billing country"],
    },
    lineItems: normalizedLineItemRows.filter(
      (lineItemRow) =>
        maybeStringified(lineItemRow["order import id"]) ===
        maybeStringified(orderRow["import id"]),
    ),
    customerNote: orderRow["customer note"],
    couponCode: orderRow["coupon code"],
  }));

  return z.array(orderImportSchema).parse(toBeParsed);
}
