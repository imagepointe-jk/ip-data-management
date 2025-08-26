import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/orderTotals.module.css";

type Props = {
  order: WooCommerceOrder;
};
export function OrderTotals({ order }: Props) {
  const totalNoShipping = +order.subtotal + +order.totalTax;

  return (
    <div className={styles["main"]}>
      <div>Subtotal: ${order.subtotal}</div>
      <div>Total Tax: ${order.totalTax}</div>
      <div>
        <span className={styles["emph"]}>Total w/o Shipping:</span> $
        {totalNoShipping.toFixed(2)}
      </div>
    </div>
  );
}
