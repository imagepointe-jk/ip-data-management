//some validations in the old validations.ts depended on non-client-friendly  imports.
//these validations are needed client-side and server-side both.
//TODO: Reorganize validations to account for this.
import {
  wooCommerceLineItemSchema,
  wooCommerceOrderDataSchema,
  wooCommerceProductSchema,
} from "../schema";

function parseWooCommerceLineItem(lineItem: any) {
  //the data that comes from WC is very messy and deeply nested.
  //this helper function can be used to pull data from each line item
  //and restructure it in a more helpful way.
  const quantity = lineItem.quantity;
  const total = lineItem.total;
  const totalTax = lineItem.total_tax;

  return wooCommerceLineItemSchema.parse({
    id: lineItem.id,
    name: lineItem.name,
    quantity,
    total,
    totalTax,
    price: lineItem.price,
    productId: lineItem.product_id,
  });
}

export function parseWooCommerceOrderJson(json: any) {
  const lineItemsUnparsed: any[] = json["line_items"];
  if (!lineItemsUnparsed) {
    console.error("No line items array in WC order");
    throw new Error();
  }
  const lineItemsParsed = lineItemsUnparsed.map((item) =>
    parseWooCommerceLineItem(item)
  );

  json.lineItems = lineItemsParsed;
  json.totalTax = json.total_tax;
  json.feeLines = json.fee_lines;
  json.shippingTotal = json.shipping_total;
  json.subtotal = lineItemsParsed
    .reduce((accum, item) => accum + +item.total, 0)
    .toFixed(2);
  json.dateCreated = new Date(json.date_created);
  json.shipping.firstName = json.shipping.first_name;
  json.shipping.lastName = json.shipping.last_name;
  json.shipping.address1 = json.shipping.address_1;
  json.shipping.address2 = json.shipping.address_2;
  json.shippingLines = json.shipping_lines;

  return wooCommerceOrderDataSchema.parse(json);
}

export function parseWooCommerceProduct(json: any) {
  return wooCommerceProductSchema.parse(json);
}
