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
  onClickSave: () => void;
  setHelpMode: (helpMode: boolean) => void;
  setStatus: (status: OrderEditFormStatus) => void;
  setStateModified: (modified: boolean) => void;
  modifyOrder: (order: WooCommerceOrder) => void;
  modifyMetaDataToAdd: (metaData: MetaData[]) => void;
};
export function SubmitArea({
  stateModified,
  removeLineItemIds,
  showHelpButton,
  onClickSave,
  setHelpMode,
}: Props) {
  return (
    <div className={styles["submit-row"]}>
      <button className={styles["button-primary"]} onClick={onClickSave}>
        Save All Changes
      </button>
      {(stateModified || removeLineItemIds.length > 0) && (
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
