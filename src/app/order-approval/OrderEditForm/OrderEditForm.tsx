"use client";

import styles from "@/styles/orderApproval/orderEditForm.module.css";
import {
  faInfoCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { LineItemTable } from "./LineItemTable";
import { ShippingInfo } from "./ShippingInfo";
import { TotalsArea } from "./TotalsArea";
import {
  WooCommerceOrder,
  WooCommerceProduct,
} from "@/types/schema/woocommerce";
import { updateOrderAction } from "@/actions/orderWorkflow/update";
import { HelpForm } from "./HelpForm";
import { NavButtons } from "../NavButtons";
import { ShippingMethods } from "./ShippingMethods";
import { CheckoutFields } from "./CheckoutFields";
import { WebstoreCheckoutField } from "@prisma/client";
import { useImmer } from "use-immer";
import { getRatedShippingMethods } from "@/order-approval/shipping";

export type Permission = "view" | "edit" | "hidden";
export type RatedShippingMethod = {
  name: string;
  total: string | null;
  statusCode: number | null;
};
export type ChangeShippingInfoParams = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  method?: string;
};
type Props = {
  orderId: number;
  storeUrl: string;
  getOrder: () => Promise<WooCommerceOrder>;
  permissions?: {
    shipping?: {
      method?: Permission;
    };
  };
  getProducts: (ids: number[]) => Promise<WooCommerceProduct[]>;
  onSubmitHelpForm: (data: FormData) => Promise<void>;
  special?: {
    //highly specific settings for edge cases
    allowUpsShippingToCanada?: boolean;
  };
  shippingMethods: string[];
  userEmail?: string; //the email of the user accessing the order view
  showNavButtons: boolean;
  checkoutFields: Omit<WebstoreCheckoutField, "webstoreId">[];
};
export function OrderEditForm({
  orderId,
  storeUrl,
  getOrder,
  getProducts,
  onSubmitHelpForm,
  permissions,
  shippingMethods,
  special,
  userEmail,
  showNavButtons,
  checkoutFields,
}: Props) {
  const [order, setOrder] = useImmer(null as WooCommerceOrder | null);
  const [products, setProducts] = useState(null as WooCommerceProduct[] | null);
  const [loading, setLoading] = useState(true);
  const [valuesMaybeUnsynced, setValuesMaybeUnsynced] = useState(false); //some values have to be calculated by woocommerce, so use this to show a warning that an update request must be made to make all values accurately reflect user changes
  const [removeLineItemIds, setRemoveLineItemIds] = useState([] as number[]); //list of line item IDs to remove from the woocommerce order when "save changes" is clicked
  const [ratedShippingMethods, setRatedShippingMethods] = useState(
    [] as RatedShippingMethod[]
  );
  const [helpMode, setHelpMode] = useState(false);
  const validShippingMethods = ratedShippingMethods.filter(
    (method) =>
      method.total !== null &&
      (method.statusCode === 200 || method.statusCode === 429)
  );

  async function onClickSave() {
    if (!order || !products) return;

    //woocommerce API requires us to set quantity to 0 for any line items we want to delete
    const lineItemsWithDeletions = order.lineItems.map((lineItem) => ({
      ...lineItem,
      quantity: removeLineItemIds.includes(lineItem.id) ? 0 : lineItem.quantity,
    }));

    setLoading(true);
    try {
      //first get updated methods based on any changed shipping info
      const updatedMethods = await getRatedShippingMethods(
        order,
        products,
        shippingMethods,
        special
      );
      setRatedShippingMethods(updatedMethods);

      const newShippingLines = choosePostUpdateShippingLines(updatedMethods);
      const updated = await updateOrderAction(
        storeUrl,
        {
          ...order,
          line_items: lineItemsWithDeletions,
          shipping: {
            ...order.shipping,
            first_name: order.shipping.firstName,
            last_name: order.shipping.lastName,
            address_1: order.shipping.address1,
            address_2: order.shipping.address2,
          },
          shipping_lines: newShippingLines,
        },
        userEmail || ""
      );
      setOrder(updated);

      setRemoveLineItemIds([]);
      setValuesMaybeUnsynced(false);
    } catch (error) {
      setOrder(null);
      console.error(error);
    }
    setLoading(false);
  }

  function choosePostUpdateShippingLines(
    updatedMethods: RatedShippingMethod[]
  ) {
    if (!order || !products) return [];

    //after the user changes shipping info, we need to check if the currently selected shipping method is still valid based on the new data.
    //this is not always the case (e.g. an international method is selected and the user changes to a domestic address)
    //if the selected method is still valid, let it be.

    //treat a method as valid even if it got an API response of 429.
    //the below auto-switch behavior should not affect the user just because of rate limiting.
    const selectedMethod = order.shippingLines[0]?.method_title;
    const validMethods = updatedMethods.filter(
      (method) =>
        method.total !== null &&
        (method.statusCode === 200 || method.statusCode === 429)
    );
    const selectedValidMethod = validMethods.find(
      (method) => method.name === selectedMethod
    );
    const validMethodsSorted = [...validMethods].sort((a, b) => {
      const aTotal = a.total ? +a.total : Number.MAX_SAFE_INTEGER;
      const bTotal = b.total ? +b.total : Number.MAX_SAFE_INTEGER; // make sure that any methods with NULL totals get pushed to the end
      return aTotal - bTotal;
    });

    //if the currently selected method is no longer valid, choose the cheapest valid one instead; NEVER save a shipping method that isn't valid for the shipping address
    //if there are no valid methods anymore, save an error string
    const cheapestValidMethod = validMethodsSorted[0];
    const forcedMethod = {
      id: order.shippingLines[0]?.id || 0,
      method_title: cheapestValidMethod
        ? cheapestValidMethod.name
        : "SHIPPING METHOD ERROR",
    };
    const newShippingLines = selectedValidMethod
      ? order.shippingLines
      : [forcedMethod];

    return newShippingLines;
  }

  async function loadOrder() {
    setLoading(true);
    try {
      const order = await getOrder();
      setOrder(order);

      const ids = order.lineItems.map((item) => item.productId);
      const products = await getProducts(ids);

      const methods = await getRatedShippingMethods(
        order,
        products,
        shippingMethods,
        special
      );

      setRatedShippingMethods(methods);
      setProducts(products);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  function onChangeShippingInfo(
    changes: ChangeShippingInfoParams,
    mayUnsyncValues?: boolean
  ) {
    if (!order) return;
    if (changes.method !== undefined) {
      //stop any invalid shipping method changes from taking place
      const isValid = !!validShippingMethods.find(
        (method) => method.name === changes.method
      );
      if (!isValid) changes.method = undefined;
    }

    setOrder((draft) => {
      if (!draft) return;
      if (changes.firstName) draft.shipping.firstName = changes.firstName;
      if (changes.lastName) draft.shipping.lastName = changes.lastName;
      if (changes.address1) draft.shipping.address1 = changes.address1;
      if (changes.address2) draft.shipping.address2 = changes.address2;
      if (changes.city) draft.shipping.city = changes.city;
      if (changes.state) draft.shipping.state = changes.state;
      if (changes.postcode) draft.shipping.postcode = changes.postcode;
      if (changes.country) draft.shipping.country = changes.country;
      if (changes.method) {
        const shippingLine = draft.shippingLines[0];
        if (shippingLine)
          shippingLine.method_title = changes.method || "SHIPPING METHOD ERROR";
      }
    });
    if (mayUnsyncValues) setValuesMaybeUnsynced(true);
  }

  useEffect(() => {
    loadOrder();
  }, []);

  return (
    <>
      <div className={styles["info-text"]}>
        Please review the following order and make changes if needed. Once
        finished, please save your changes and then approve or deny the order.
      </div>
      <div className={styles["main"]}>
        {!helpMode && (
          <>
            {loading && (
              <div className={styles["update-overlay"]}>
                <div>{`${order ? "Updating" : "Loading"}`} order...</div>
              </div>
            )}
            {!order && !loading && <div>Error finding order.</div>}
            {order && (
              <>
                <h2>Order {orderId}</h2>
                <div>Placed on {order.dateCreated.toLocaleDateString()}</div>
                <LineItemTable
                  order={order}
                  setOrder={setOrder}
                  removeLineItemIds={removeLineItemIds}
                  setRemoveLineItemIds={setRemoveLineItemIds}
                  setValuesMaybeUnsynced={setValuesMaybeUnsynced}
                />
                <div className={styles["extra-details-flex"]}>
                  <div className={styles["main-fields-parent"]}>
                    <ShippingInfo
                      order={order}
                      ratedShippingMethods={ratedShippingMethods}
                      onChangeShippingInfo={onChangeShippingInfo}
                    />
                    <CheckoutFields fields={checkoutFields} order={order} />
                    {permissions?.shipping?.method === "edit" && (
                      <ShippingMethods
                        order={order}
                        ratedShippingMethods={ratedShippingMethods}
                        onChangeShippingInfo={onChangeShippingInfo}
                      />
                    )}
                  </div>
                  <TotalsArea
                    order={order}
                    ratedShippingMethods={ratedShippingMethods}
                  />
                </div>
                <div className={styles["edit-help-text"]}>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className={styles["info-circle"]}
                  />
                  You may edit quantities, shipping methods and remove products
                  if needed. Please keep in mind once a product is removed it
                  cannot be added back on this order page. Please contact us if
                  you need help with changing an order by following the link
                  below.
                </div>
                <div className={styles["submit-row"]}>
                  <button className={styles["submit"]} onClick={onClickSave}>
                    Save All Changes
                  </button>
                  {(valuesMaybeUnsynced || removeLineItemIds.length > 0) && (
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className={styles["info-circle-warning"]}
                      size="2x"
                      title="Some values may be out-of-sync. Save changes to update."
                    />
                  )}
                  <button
                    className={styles["help-button"]}
                    onClick={() => setHelpMode(true)}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} /> I need help with
                    my order
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {helpMode && (
          <HelpForm
            setHelpMode={setHelpMode}
            onSubmitHelpForm={onSubmitHelpForm}
          />
        )}
      </div>
      {showNavButtons && <NavButtons beforeApproveNow={onClickSave} />}
    </>
  );
}
