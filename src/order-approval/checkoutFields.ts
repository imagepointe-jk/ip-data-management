import { WooCommerceOrder } from "@/types/schema/woocommerce";

export const checkoutFieldTypes = [
  {
    name: "text",
    displayName: "Text",
  },
  {
    name: "select",
    displayName: "Select",
  },
];

export function getFieldValue(fieldName: string, order: WooCommerceOrder) {
  if (["order_comments", "customer_note"].includes(fieldName))
    return order.customerNote;

  const matchingOrderData = order.metaData.find(
    (meta) => meta.key === fieldName
  );
  return matchingOrderData?.value || "";
}
