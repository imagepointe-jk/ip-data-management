import { WooCommerceOrder } from "@/types/schema/woocommerce";

export function createUpdateData(
  order: WooCommerceOrder,
  removeLineItemIds: number[]
) {
  //woocommerce API requires us to set quantity to 0 for any line items we want to delete
  //set quantity 0 as needed, but leave the rest of the line items unchanged
  const lineItemsWithDeletions = order.lineItems.map((lineItem) => ({
    ...lineItem,
    quantity: removeLineItemIds.includes(lineItem.id) ? 0 : lineItem.quantity,
  }));

  return {
    id: order.id,
    customer_note: order.customerNote,
    line_items: lineItemsWithDeletions,
    meta_data: order.metaData,
    shipping: {
      ...order.shipping,
      first_name: order.shipping.firstName,
      last_name: order.shipping.lastName,
      address_1: order.shipping.address1,
      address_2: order.shipping.address2,
    },
    shipping_lines: order.shippingLines,
  };
}
