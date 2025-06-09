import {
  wooCommerceDAProductSchema,
  wooCommerceDAProductVariationSchema,
  wooCommerceLineItemSchema,
  wooCommerceOrderDataSchema,
  wooCommerceProductSchema,
} from "../schema/woocommerce";

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
  const metaDataWithStringValues = (json.meta_data as any[]).filter(
    (meta) => typeof meta.value === "string"
  ); //values can be strings, objects, or arrays; just focus on strings for now

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
  json.metaData = metaDataWithStringValues;
  json.customerNote = json.customer_note || "";

  return wooCommerceOrderDataSchema.parse(json);
}

export function parseWooCommerceProduct(json: any) {
  if (!json.images) json.images = [];

  return wooCommerceProductSchema.parse(json);
}

export function parseWooCommerceDAProductsResponse(json: any) {
  const products = json.data.products.nodes;
  if (!Array.isArray(products))
    throw new Error("Products array not found in GQL response.");

  return products.map((product: any) => {
    const variations = product.variations.nodes;
    const attributes = product.globalAttributes.edges;

    return wooCommerceDAProductSchema.parse({
      id: product.id,
      databaseId: product.databaseId,
      name: product.name || "NO NAME",
      sku: product.sku,
      status: product.status,
      globalAttributes: !Array.isArray(attributes)
        ? []
        : attributes.map((item: any) => ({
            name: item.node.name,
            terms: item.node.terms.edges.map((item: any) => ({
              slug: item.node.slug,
            })),
          })),
      variations: !Array.isArray(variations)
        ? []
        : variations.map((variation: any) =>
            wooCommerceDAProductVariationSchema.parse({
              id: variation.id,
              databaseId: variation.databaseId,
              name: variation.name || "NO NAME",
              sku: variation.sku,
              stockQuantity: variation.stockQuantity || 0,
            })
          ),
    });
  });
}
