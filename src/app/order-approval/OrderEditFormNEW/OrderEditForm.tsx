"use client";

import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { LineItems } from "./LineItems";
import { OrderTotals } from "./OrderTotals";
import { DraftFunction, useImmer } from "use-immer";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { ShippingInfo } from "./ShippingInfo";
import { AdditionalInfo } from "./AdditionalInfo";
import { WebstoreCheckoutField } from "@prisma/client";

export type MetaData = {
  key: string;
  value: string;
};
type Props = {
  order: WooCommerceOrder;
  checkoutFields: WebstoreCheckoutField[];
};
export function OrderEditForm({ order: initialOrder, checkoutFields }: Props) {
  const [order, sO] = useImmer(initialOrder); //"sO" = setOrder; should only be called from the modifyOrder wrapper
  const [stateModified, setStateModified] = useState(false); //allows us to mark the order state as "modified" to remind the user that they've made changes
  //to add metadata that isn't already in the WC order, WC requires us to make a separate POST request
  //keep track of anything we're going to add here
  const [metaDataToAdd, sMDTA] = useState<MetaData[]>([]); //smda = setMetaDataToAdd; should only be called from the modifyMetaDataToAdd wrapper

  //force all order state modifications to go through this wrapper; this ensures that all updates mark the order state as "modified"
  function modifyOrder(
    arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>
  ) {
    sO(arg);
    setStateModified(true);
  }

  function modifyMetaDataToAdd(metaData: MetaData[]) {
    sMDTA(metaData);
    setStateModified(true);
  }

  return (
    <div className={styles["main"]}>
      <h2>Order {order.id}</h2>
      <div>Placed on {order.dateCreated.toLocaleDateString()}</div>
      <LineItems order={order} modifyOrder={modifyOrder} />
      <div className={styles["fields-and-totals-flex"]}>
        <ShippingInfo order={order} modifyOrder={modifyOrder} />
        <OrderTotals order={order} />
      </div>
      <AdditionalInfo
        order={order}
        checkoutFields={checkoutFields}
        metaDataToAdd={metaDataToAdd}
        modifyOrder={modifyOrder}
        modifyMetaDataToAdd={modifyMetaDataToAdd}
      />
      <div className={styles["submit-row"]}>
        <button className={styles["save-button"]}>Save All Changes</button>
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
    </div>
  );
}
