import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/approverArea/orderEditForm/orderTotals.module.css";

type Props = {
  order: WooCommerceOrder;
};
export function OrderTotals({ order }: Props) {
  const handlingFee = order.feeLines.find(
    (line) => line.name.toLocaleLowerCase() === "handling fee"
  );
  const otherFees = order.feeLines.filter(
    (line) => line.name.toLocaleLowerCase() !== "handling fee"
  );

  const feesTotal = order.feeLines.reduce((accum, item) => {
    const total = isNaN(+item.total) ? 0 : +item.total;
    return accum + total;
  }, 0);
  const totalToDisplay = +order.subtotal + +order.totalTax + feesTotal;

  return (
    <div className={styles["main"]}>
      <div>Item Total: ${order.subtotal}</div>
      <div>Sales Tax: ${order.totalTax}</div>
      <div>
        Handling Fee: {handlingFee ? `$${handlingFee.total}` : "Billed"}
      </div>
      {otherFees.map((line) => (
        <div key={line.id}>
          {line.name}: {`$${line.total}`}
        </div>
      ))}
      <div>
        <span className={styles["emph"]}>Total w/o Shipping:</span> $
        {totalToDisplay.toFixed(2)}
      </div>
    </div>
  );
}
