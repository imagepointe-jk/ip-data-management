import { updateOrderAction } from "@/actions/orderWorkflow/update";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetaData, OrderEditFormStatus } from "./OrderEditForm";

type Props = {
  storeUrl: string;
  order: WooCommerceOrder;
  stateModified: boolean;
  userEmail: string;
  metaDataToAdd: MetaData[];
  removeLineItemIds: number[];
  showHelpButton: boolean;
  setHelpMode: (helpMode: boolean) => void;
  setStatus: (status: OrderEditFormStatus) => void;
  setStateModified: (modified: boolean) => void;
  modifyOrder: (order: WooCommerceOrder) => void;
  modifyMetaDataToAdd: (metaData: MetaData[]) => void;
};
export function SubmitArea({
  storeUrl,
  order,
  stateModified,
  userEmail,
  metaDataToAdd,
  removeLineItemIds,
  showHelpButton,
  setHelpMode,
  setStatus,
  setStateModified,
  modifyMetaDataToAdd,
  modifyOrder,
}: Props) {
  function createUpdateData() {
    //woocommerce API requires us to set quantity to 0 for any line items we want to delete
    //set quantity 0 as needed, but leave the rest of the line items unchanged
    const lineItemsWithDeletions = order.lineItems.map((lineItem) => ({
      ...lineItem,
      quantity: removeLineItemIds.includes(lineItem.id) ? 0 : lineItem.quantity,
    }));

    return {
      id: order.id,
      customer_note: order.customerNote,
      line_items: lineItemsWithDeletions,
      meta_data: order.metaData,
      shipping: {
        ...order.shipping,
        first_name: order.shipping.firstName,
        last_name: order.shipping.lastName,
        address_1: order.shipping.address1,
        address_2: order.shipping.address2,
      },
      shipping_lines: order.shippingLines,
    };
  }

  async function onClickSave() {
    setStatus("loading");
    try {
      const updatedOrder = await updateOrderAction(
        storeUrl,
        createUpdateData(),
        metaDataToAdd,
        userEmail
      );

      setStatus("idle");
      modifyOrder(updatedOrder);
      modifyMetaDataToAdd([]);
      setStateModified(false);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className={styles["submit-row"]}>
      <button className={styles["button-primary"]} onClick={onClickSave}>
        Save All Changes
      </button>
      {stateModified && (
        <span title="Some values may be out-of-sync. Save changes to update.">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className={styles["info-circle-warning"]}
            size="2x"
          />
        </span>
      )}
      {showHelpButton && (
        <button
          className={styles["help-button"]}
          onClick={() => setHelpMode(true)}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          {" I need help with my order"}
        </button>
      )}
    </div>
  );
}
