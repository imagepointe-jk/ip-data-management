import styles from "@/styles/WooOrderView.module.css";
import { WooCommerceOrder } from "@/types/schema";

type Props = {
  order: WooCommerceOrder;
};
export function TotalsArea({ order }: Props) {
  return (
    <div className={styles["totals"]}>
      <div>Subtotal: ${order.subtotal}</div>
      <div>Total Tax: ${order.totalTax}</div>
      {/* <div>Shipping Total: ${order.shippingTotal}</div> */}
      <div className={styles["grand-total"]}>
        {`Grand Total: $${(+order.total - +order.shippingTotal).toFixed(2)}`}
        <div className={styles["grand-total-asterisk"]}>*</div>
      </div>
      <div className={styles["info-box"]}>
        *Grand total is an estimate and does not include shipping cost.
      </div>
    </div>
  );
}
