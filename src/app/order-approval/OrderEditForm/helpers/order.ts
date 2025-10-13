import { createOrderDiff } from "@/order-approval/utility/global";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

export function wasOrderStateModified(
  staleOrder: WooCommerceOrder,
  newOrder: WooCommerceOrder,
  metaDataToAdd: { key: string; value: string }[]
) {
  if (metaDataToAdd.length > 0) return true;

  const diff = createOrderDiff(staleOrder, newOrder, metaDataToAdd);

  //check basic properties
  if (diff.customerNote === "changed") return true;
  if (diff.shippingMethod === "changed") return true;

  //check metadata
  if (!!diff.metaData.find((item) => item.value === "changed")) return true;

  //check all shipping properties
  let key: keyof typeof diff.shipping;
  for (key in diff.shipping) {
    if (diff.shipping[key] === "changed") return true;
  }

  //check line items for changed quantities
  if (!!diff.lineItems.find((item) => item.quantity === "changed")) return true;

  return false;
}
