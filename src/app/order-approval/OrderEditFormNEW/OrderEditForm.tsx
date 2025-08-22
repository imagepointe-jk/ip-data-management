"use client";

import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { LineItems } from "./LineItems";
import { OrderTotals } from "./OrderTotals";
import { DraftFunction, useImmer } from "use-immer";
import { useEffect, useState } from "react";
import { ShippingInfo } from "./ShippingInfo";
import { AdditionalInfo } from "./AdditionalInfo";
import { WebstoreCheckoutField, WebstoreShippingMethod } from "@prisma/client";
import { SubmitArea } from "./SubmitArea";
import { Overlays } from "./Overlays";
import { HelpForm } from "./HelpForm";
import { NavButtons } from "../NavButtonsNEW";
import { ShippingMethods } from "./ShippingMethods";
import { updateOrderAction } from "@/actions/orderWorkflow/update";
import { createUpdateData } from "./helpers/order";
import {
  getRatedShippingMethods,
  RatedShippingMethod,
  reviseOrderAfterShippingRates,
} from "./helpers/shipping";

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
  shippingMethods: WebstoreShippingMethod[];
  allowHelpRequest: boolean;
};
export function OrderEditForm({
  order: initialOrder,
  storeUrl,
  userEmail,
  checkoutFields,
  shippingMethods,
  allowHelpRequest,
}: Props) {
  const [order, sO] = useImmer(initialOrder); //"sO" = setOrder; should only be called from the modifyOrder wrapper
  const [stateModified, setStateModified] = useState(false); //allows us to mark the order state as "modified" to remind the user that they've made changes
  //to add metadata that isn't already in the WC order, WC requires us to make a separate POST request
  //keep track of anything we're going to add here
  const [metaDataToAdd, sMDTA] = useState<MetaData[]>([]); //sMDTA = setMetaDataToAdd; should only be called from the modifyMetaDataToAdd wrapper
  const [status, setStatus] = useState<OrderEditFormStatus>("loading");
  const [removeLineItemIds, setRemoveLineItemIds] = useState([] as number[]); //list of line item IDs to remove from the woocommerce order when "save changes" is clicked
  const [helpMode, setHelpMode] = useState(false);
  const [ratedShippingMethods, setRatedShippingMethods] = useState<
    RatedShippingMethod[]
  >([]);

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

  async function saveOrder() {
    setStatus("loading");
    try {
      //first get updated methods based on any changed shipping info
      const newRatedMethods = await getRatedShippingMethods(
        order,
        shippingMethods
      );
      setRatedShippingMethods(newRatedMethods);

      //we might need to edit what the user has selected (e.g. if the changed shipping address makes the selected shipping method invalid)
      const revisedOrder = reviseOrderAfterShippingRates(
        order,
        newRatedMethods
      );

      const updatedOrder = await updateOrderAction(
        storeUrl,
        createUpdateData(revisedOrder, removeLineItemIds),
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

  useEffect(() => {
    async function initial() {
      const newRatedMethods = await getRatedShippingMethods(
        order,
        shippingMethods
      );
      setRatedShippingMethods(newRatedMethods);
      setStatus("idle");
    }
    initial();
  }, []);

  return (
    <>
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
        <ShippingMethods
          order={order}
          ratedShippingMethods={ratedShippingMethods}
        />
        <SubmitArea
          order={order}
          stateModified={stateModified}
          storeUrl={storeUrl}
          userEmail={userEmail}
          metaDataToAdd={metaDataToAdd}
          removeLineItemIds={removeLineItemIds}
          showHelpButton={allowHelpRequest}
          onClickSave={saveOrder}
          setHelpMode={setHelpMode}
          setStatus={setStatus}
          setStateModified={setStateModified}
          modifyOrder={modifyOrder}
          modifyMetaDataToAdd={modifyMetaDataToAdd}
        />
        {helpMode && <HelpForm setHelpMode={setHelpMode} />}
        <Overlays status={status} setStatus={setStatus} />
      </div>
      <NavButtons allowApprove={!stateModified} display={{ review: false }} />
    </>
  );
}
