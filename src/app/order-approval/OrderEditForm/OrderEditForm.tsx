"use client";

import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/approverArea/orderEditForm/main.module.css";
import { LineItems } from "./LineItems";
import { OrderTotals } from "./OrderTotals";
import { useImmer } from "use-immer";
import { useEffect, useState } from "react";
import { ShippingInfo } from "./ShippingInfo";
import { AdditionalInfo } from "./AdditionalInfo";
import { WebstoreCheckoutField, WebstoreShippingMethod } from "@prisma/client";
import { SubmitArea } from "./SubmitArea";
import { Overlays } from "./Overlays";
import { HelpForm } from "./HelpForm";
import { NavButtons } from "../NavButtons";
import { updateOrderAction } from "@/actions/orderWorkflow/update";
import {
  getRatedShippingMethods,
  RatedShippingMethod,
  reviseOrderAfterShippingRates,
} from "./helpers/shipping";
import { BeforeSubmitArea } from "./BeforeSubmitArea";
import { wasOrderStateModified } from "./helpers/order";

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
  allowUpsShippingToCanada?: boolean;
};
export function OrderEditForm({
  order: initialOrder,
  storeUrl,
  userEmail,
  checkoutFields,
  shippingMethods,
  allowHelpRequest,
  allowUpsShippingToCanada,
}: Props) {
  const [order, setOrder] = useImmer(initialOrder);
  const [staleOrder, setStaleOrder] = useState(initialOrder); //only updated when the order gets updated in the database; used to diff and determine if the user has changed anything
  //to add metadata that isn't already in the WC order, WC requires us to make a separate POST request
  //keep track of anything we're going to add here
  const [metaDataToAdd, setMetaDataToAdd] = useState<MetaData[]>([]);
  const [status, setStatus] = useState<OrderEditFormStatus>("loading");
  const [removeLineItemIds, setRemoveLineItemIds] = useState([] as number[]); //list of line item IDs to remove from the woocommerce order when "save changes" is clicked
  const [helpMode, setHelpMode] = useState(false);
  const [ratedShippingMethods, setRatedShippingMethods] = useState<
    RatedShippingMethod[]
  >([]);
  const stateModified = wasOrderStateModified(staleOrder, order, metaDataToAdd);

  async function saveOrder() {
    setStatus("loading");
    try {
      //first get updated methods based on any changed shipping info
      let start = Date.now();
      console.log(
        "Getting updated shipping rates based on current shipping info..."
      );
      const newRatedMethods = await getRatedShippingMethods(
        order,
        shippingMethods,
        {
          allowUpsShippingToCanada,
        }
      );
      setRatedShippingMethods(newRatedMethods);
      console.log(`Shipping rates retrieved in ${Date.now() - start} ms.`);

      //we might need to edit what the user has selected (e.g. if the changed shipping address makes the selected shipping method invalid)
      const revisedOrder = reviseOrderAfterShippingRates(
        order,
        newRatedMethods
      );

      console.log("Updating order data...");
      start = Date.now();
      const updatedOrder = await updateOrderAction(
        storeUrl,
        staleOrder,
        revisedOrder,
        removeLineItemIds,
        metaDataToAdd,
        userEmail
      );

      console.log(`Order updated in ${Date.now() - start} ms.`);
      setStatus("idle");
      setOrder(updatedOrder);
      setStaleOrder(updatedOrder);
      setMetaDataToAdd([]);
      setRemoveLineItemIds([]);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  useEffect(() => {
    async function initial() {
      const start = Date.now();
      console.log("Getting initial shipping rates...");
      const newRatedMethods = await getRatedShippingMethods(
        order,
        shippingMethods,
        {
          allowUpsShippingToCanada,
        }
      );
      setRatedShippingMethods(newRatedMethods);
      setStatus("idle");
      console.log(`Shipping rates retrieved in ${Date.now() - start} ms.`);
    }
    initial();
  }, []);

  return (
    <>
      <div className={styles["main"]}>
        <h2>Order {order.number}</h2>
        <div>Placed on {order.dateCreated.toLocaleDateString()}</div>
        <LineItems
          order={order}
          setOrder={setOrder}
          removeLineItemIds={removeLineItemIds}
          setRemoveLineItemIds={setRemoveLineItemIds}
        />
        <div className={styles["fields-and-totals-flex"]}>
          <ShippingInfo order={order} setOrder={setOrder} />
          <OrderTotals order={order} />
        </div>
        <AdditionalInfo
          order={order}
          checkoutFields={checkoutFields}
          metaDataToAdd={metaDataToAdd}
          setOrder={setOrder}
          setMetaDataToAdd={setMetaDataToAdd}
        />
        <BeforeSubmitArea
          order={order}
          setOrder={setOrder}
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
        />
        {helpMode && <HelpForm setHelpMode={setHelpMode} />}
        <Overlays status={status} setStatus={setStatus} />
      </div>
      <NavButtons
        allowApprove={!stateModified && removeLineItemIds.length === 0}
        display={{ review: false }}
      />
    </>
  );
}
