import styles from "@/styles/orderApproval/new/orderEditForm/lineItems.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DraftFunction } from "use-immer";

type Props = {
  order: WooCommerceOrder;
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
  removeLineItemIds: number[];
  setRemoveLineItemIds: (ids: number[]) => void;
};
export function LineItemRow({
  order,
  lineItem,
  modifyOrder,
  removeLineItemIds,
  setRemoveLineItemIds,
}: Props) {
  const { name, price, quantity, total, id } = lineItem;
  const markedForDeletion = removeLineItemIds.includes(id);
  const undeletedItemsLeft = order.lineItems.length - removeLineItemIds.length;

  function onChangeQuantity(value: string) {
    const newValue = +value;
    if (isNaN(newValue) || newValue < 1) return;

    modifyOrder((draft) => {
      const lineItem = draft.lineItems.find((item) => item.id === id);
      if (!lineItem) {
        console.error(`Line item with id ${id} not found`);
        return;
      }

      lineItem.quantity = newValue;
      //we HAVE to update the total ourselves when we update the quantity
      //otherwise WC API will (incorrectly) change the unit price of the item so that newQuantity * unitPrice still equals the existing total
      lineItem.total = (lineItem.quantity * lineItem.price).toFixed(2);
    });
  }

  function onClickDeleteButton() {
    setRemoveLineItemIds(
      markedForDeletion
        ? removeLineItemIds.filter((existingId) => existingId !== id)
        : [...removeLineItemIds, id]
    );
  }

  return (
    <div className={styles["fake-table-row"]}>
      <div
        className={`${styles["fake-table-cell"]} ${styles["fake-table-column-1"]}`}
      >
        {!(!markedForDeletion && undeletedItemsLeft < 2) && (
          <button
            className={styles["remove-line-item-button"]}
            onClick={onClickDeleteButton}
          >
            {!markedForDeletion && <FontAwesomeIcon icon={faXmark} />}
            {markedForDeletion && "Undo"}
          </button>
        )}
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
          disabled={markedForDeletion}
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
      {markedForDeletion && <div className={styles["cross-out"]}></div>}
    </div>
  );
}
