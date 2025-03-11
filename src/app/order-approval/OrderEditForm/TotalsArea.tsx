import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { RatedShippingMethod } from "./OrderEditForm";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

type Props = {
  order: WooCommerceOrder;
  ratedShippingMethods: RatedShippingMethod[];
};
export function TotalsArea({ order, ratedShippingMethods }: Props) {
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
      name: "Total w/o Shipping",
      amount: (+order.total + +order.totalTax).toFixed(2),
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
    </div>
  );
}
