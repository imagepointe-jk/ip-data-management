import styles from "@/styles/WooOrderView.module.css";
import { WooCommerceOrder } from "@/types/schema";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction } from "react";

type Props = {
  order: WooCommerceOrder;
  setOrder: Dispatch<SetStateAction<WooCommerceOrder | null>>;
  removeLineItemIds: number[];
  setRemoveLineItemIds: Dispatch<SetStateAction<number[]>>;
  setValuesMaybeUnsynced: (b: boolean) => void;
};
export function LineItemTable({
  order,
  setOrder,
  removeLineItemIds,
  setRemoveLineItemIds,
  setValuesMaybeUnsynced,
}: Props) {
  function onChangeLineItemQuantity(id: number, valueStr: string) {
    if (!order) return;

    const newOrder = { ...order };
    const item = newOrder.lineItems.find((item) => item.id === id);
    if (!item) return;

    item.quantity = +valueStr;
    item.total = (item.quantity * item.price).toFixed(2);

    setValuesMaybeUnsynced(true);
    setOrder(newOrder);
  }

  function setLineItemDelete(idToSet: number, willDelete: boolean) {
    const newRemoveLineItems = !willDelete
      ? [...removeLineItemIds].filter((id) => idToSet !== id)
      : [...removeLineItemIds, idToSet];
    setRemoveLineItemIds(newRemoveLineItems);
  }

  return (
    <div className={styles["table-scroll"]}>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Quantity</th>
            <th className={styles["column-right-align"]}>Unit Price</th>
            <th className={styles["column-right-align"]}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.lineItems.map((item) => (
            <tr key={item.id}>
              <td className={styles["line-item-x-container"]}>
                <button
                  className={styles["line-item-x"]}
                  onClick={() =>
                    setLineItemDelete(
                      item.id,
                      !removeLineItemIds.includes(item.id)
                    )
                  }
                >
                  {!removeLineItemIds.includes(item.id) ? (
                    <FontAwesomeIcon icon={faXmark} />
                  ) : (
                    "undo"
                  )}
                </button>
              </td>
              <td
                className={
                  removeLineItemIds.includes(item.id)
                    ? styles["deleted-line-item"]
                    : undefined
                }
              >
                {item.name}
              </td>
              <td
                className={
                  removeLineItemIds.includes(item.id)
                    ? styles["deleted-line-item"]
                    : undefined
                }
              >
                <input
                  type="number"
                  onChange={(e) =>
                    onChangeLineItemQuantity(item.id, e.target.value)
                  }
                  defaultValue={item.quantity}
                  disabled={removeLineItemIds.includes(item.id)}
                />
              </td>
              <td
                className={`${
                  removeLineItemIds.includes(item.id)
                    ? styles["deleted-line-item"]
                    : undefined
                } ${styles["column-right-align"]}`}
              >
                ${item.price.toFixed(2)}
              </td>
              <td
                className={`${
                  removeLineItemIds.includes(item.id)
                    ? styles["deleted-line-item"]
                    : undefined
                } ${styles["column-right-align"]}`}
              >
                ${item.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
