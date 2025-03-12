import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction } from "react";
import { Updater } from "use-immer";

type Props = {
  order: WooCommerceOrder;
  setOrder: Updater<WooCommerceOrder | null>;
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

    try {
      setOrder((draft) => {
        const item = draft?.lineItems.find((item) => item.id === id);
        if (!item) throw new Error(`Item with id ${id} not found`);

        item.quantity = +valueStr;
        item.total = (item.quantity * item.price).toFixed(2);
      });

      setValuesMaybeUnsynced(true);
    } catch (error) {
      console.error(error);
    }
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
          {order.lineItems.map((item) => {
            const oneItemLeftUndeleted =
              order.lineItems.length - removeLineItemIds.length < 2;
            const thisItemMarkedForDeletion = !!removeLineItemIds.find(
              (id) => item.id === id
            );
            const showDeleteButton = !(
              oneItemLeftUndeleted && !thisItemMarkedForDeletion
            );

            return (
              <tr key={item.id}>
                <td className={styles["line-item-x-container"]}>
                  {showDeleteButton && (
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
                  )}
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
                    min={1}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
