import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/orderTotals.module.css";

type Props = {
  order: WooCommerceOrder;
};
export function OrderTotals({ order }: Props) {
  const handlingFee = order.feeLines.find(
    (line) => line.name.toLocaleLowerCase() === "handling fee"
  );
  const handlingFeeAmount = handlingFee?.total ? +handlingFee.total : 0;
  const totalToDisplay = +order.subtotal + +order.totalTax + handlingFeeAmount;

  return (
    <div className={styles["main"]}>
      <div>Item Total: ${order.subtotal}</div>
      <div>Sales Tax: ${order.totalTax}</div>
      <div>
        Handling Fee: {handlingFee ? `$${handlingFee.total}` : "Billed"}
      </div>
      <div>
        <span className={styles["emph"]}>Total w/o Shipping:</span> $
        {totalToDisplay.toFixed(2)}
      </div>
    </div>
  );
}
