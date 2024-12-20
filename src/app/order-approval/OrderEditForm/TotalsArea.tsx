import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { RatedShippingMethod } from "./OrderEditForm";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

type Props = {
  order: WooCommerceOrder;
  ratedShippingMethods: RatedShippingMethod[];
};
export function TotalsArea({ order, ratedShippingMethods }: Props) {
  const chosenMethod = ratedShippingMethods.find(
    (method) => method.name === order.shippingLines[0]?.method_title
  );
  const chosenMethodTotal =
    chosenMethod && chosenMethod.total ? +chosenMethod.total : 0;
  const grandTotal = +order.total - +order.shippingTotal + chosenMethodTotal;
  const totals: {
    name: string;
    amount: string | null;
    asterisk?: boolean;
    bold?: boolean;
  }[] = [
    {
      name: "Subtotal",
      amount: order.subtotal,
    },
    {
      name: "Total Tax",
      amount: order.totalTax,
    },
    {
      name: "Shipping Total",
      amount: chosenMethodTotal ? chosenMethodTotal.toFixed(2) : null,
      asterisk: true,
    },
    {
      name: "Grand Total",
      amount: grandTotal.toFixed(2),
      asterisk: true,
      bold: true,
    },
  ];

  return (
    <div className={styles["totals"]}>
      {totals.map((total) => (
        <div
          key={total.name}
          className={`${styles["totals-row"]} ${
            total.bold ? styles["totals-bold"] : ""
          }`}
        >
          {total.name}: ${total.amount || "--"}
          {total.asterisk && <div className={styles["totals-asterisk"]}>*</div>}
        </div>
      ))}
      <div className={styles["info-box"]}>
        *Shipping costs listed are estimates only. Actual shipping charges may
        be more or less than shown. Please allow 24-48 business hours (M-F) to
        process the order plus estimated delivery time for your order to arrive.
      </div>
    </div>
  );
}
