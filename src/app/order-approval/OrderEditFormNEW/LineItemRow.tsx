import styles from "@/styles/orderApproval/new/orderEditForm/lineItems.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DraftFunction } from "use-immer";

type Props = {
  lineItem: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: string;
  };
  modifyOrder: (
    arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>
  ) => void;
};
export function LineItemRow({ lineItem, modifyOrder }: Props) {
  const { name, price, quantity, total, id } = lineItem;

  function onChangeQuantity(value: string) {
    const newValue = +value;
    if (isNaN(newValue) || newValue < 1) return;

    modifyOrder((draft) => {
      const lineItem = draft.lineItems.find((item) => item.id === id);
      if (lineItem) lineItem.quantity = newValue;
    });
  }

  return (
    <div className={styles["fake-table-row"]}>
      <div
        className={`${styles["fake-table-cell"]} ${styles["fake-table-column-1"]}`}
      >
        <button>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <div
        className={`${styles["fake-table-cell"]} ${styles["fake-table-column-2"]}`}
      >
        {name}
      </div>
      <div
        className={`${styles["fake-table-cell"]} ${styles["fake-table-column-3"]}`}
      >
        <input
          type="number"
          value={quantity}
          onChange={(e) => onChangeQuantity(e.target.value)}
        />
      </div>
      <div
        className={`${styles["fake-table-cell"]} ${styles["fake-table-column-4"]}`}
      >
        ${price.toFixed(2)}
      </div>
      <div
        className={`${styles["fake-table-cell"]} ${styles["fake-table-column-5"]}`}
      >
        ${total}
      </div>
    </div>
  );
}
