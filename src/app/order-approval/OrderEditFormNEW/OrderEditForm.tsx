"use client";

import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { LineItems } from "./LineItems";
import { OrderTotals } from "./OrderTotals";
import { DraftFunction, useImmer } from "use-immer";
import { useState } from "react";
import { ShippingInfo } from "./ShippingInfo";
import { AdditionalInfo } from "./AdditionalInfo";
import { WebstoreCheckoutField } from "@prisma/client";
import { SubmitArea } from "./SubmitArea";
import { Overlays } from "./Overlays";

export type MetaData = {
  key: string;
  value: string;
};
export type OrderEditFormStatus = "idle" | "loading" | "error";
type Props = {
  order: WooCommerceOrder;
  storeUrl: string;
  userEmail: string; //the email of the user accessing the order view
  checkoutFields: WebstoreCheckoutField[];
};
export function OrderEditForm({
  order: initialOrder,
  storeUrl,
  userEmail,
  checkoutFields,
}: Props) {
  const [order, sO] = useImmer(initialOrder); //"sO" = setOrder; should only be called from the modifyOrder wrapper
  const [stateModified, setStateModified] = useState(false); //allows us to mark the order state as "modified" to remind the user that they've made changes
  //to add metadata that isn't already in the WC order, WC requires us to make a separate POST request
  //keep track of anything we're going to add here
  const [metaDataToAdd, sMDTA] = useState<MetaData[]>([]); //sMDTA = setMetaDataToAdd; should only be called from the modifyMetaDataToAdd wrapper
  const [status, setStatus] = useState<OrderEditFormStatus>("idle");
  const [removeLineItemIds, setRemoveLineItemIds] = useState([] as number[]); //list of line item IDs to remove from the woocommerce order when "save changes" is clicked

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
      <LineItems
        order={order}
        modifyOrder={modifyOrder}
        removeLineItemIds={removeLineItemIds}
        setRemoveLineItemIds={setRemoveLineItemIds}
      />
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
      <SubmitArea
        order={order}
        stateModified={stateModified}
        storeUrl={storeUrl}
        userEmail={userEmail}
        metaDataToAdd={metaDataToAdd}
        removeLineItemIds={removeLineItemIds}
        setStatus={setStatus}
        setStateModified={setStateModified}
        modifyOrder={modifyOrder}
        modifyMetaDataToAdd={modifyMetaDataToAdd}
      />
      <Overlays status={status} setStatus={setStatus} />
    </div>
  );
}
