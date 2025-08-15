import styles from "@/styles/orderApproval/new/orderEditForm/lineItems.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { LineItemRow } from "./LineItemRow";
import { DraftFunction } from "use-immer";

type Props = {
  order: WooCommerceOrder;
  modifyOrder: (
    arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>
  ) => void;
};
export function LineItems({ order, modifyOrder }: Props) {
  return (
    <div className={styles["main"]}>
      <div className={styles["fake-table-header-row"]}>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-1"]}`}
        ></div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-2"]}`}
        >
          Name
        </div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-3"]}`}
        >
          Quantity
        </div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-4"]}`}
        >
          Unit Price
        </div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-5"]}`}
        >
          Amount
        </div>
      </div>
      {order.lineItems.map((item) => (
        <LineItemRow key={item.id} lineItem={item} modifyOrder={modifyOrder} />
      ))}
    </div>
  );
}
