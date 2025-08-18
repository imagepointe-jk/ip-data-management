import { updateOrderAction } from "@/actions/orderWorkflow/update";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OrderEditFormStatus } from "./OrderEditForm";

type Props = {
  storeUrl: string;
  order: WooCommerceOrder;
  stateModified: boolean;
  userEmail: string;
  setStatus: (status: OrderEditFormStatus) => void;
  setStateModified: (modified: boolean) => void;
};
export function SubmitArea({
  storeUrl,
  order,
  stateModified,
  userEmail,
  setStatus,
  setStateModified,
}: Props) {
  async function onClickSave() {
    setStatus("loading");
    try {
      const updatedOrder = await updateOrderAction(
        storeUrl,
        {
          id: order.id,
          customer_note: order.customerNote,
          line_items: order.lineItems,
          meta_data: order.metaData,
          shipping: {
            ...order.shipping,
            first_name: order.shipping.firstName,
            last_name: order.shipping.lastName,
            address_1: order.shipping.address1,
            address_2: order.shipping.address2,
          },
          shipping_lines: order.shippingLines,
        },
        [],
        userEmail
      );
      console.log(updatedOrder);
      setStatus("idle");
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
    </div>
  );
}
