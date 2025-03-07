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
import { rateShippingMethod } from "@/order-approval/shipping";
import {
  WooCommerceOrder,
  WooCommerceProduct,
} from "@/types/schema/woocommerce";
import { updateOrderAction } from "@/actions/orderWorkflow/update";
import { HelpForm } from "./HelpForm";
import { CONTACT_US_URL } from "@/constants";
import { NavButtons } from "../NavButtons";

export type Permission = "view" | "edit" | "hidden";
export type RatedShippingMethod = {
  name: string;
  total: string | null;
  statusCode: number | null;
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
}: Props) {
  const [order, setOrder] = useState(null as WooCommerceOrder | null);
  const [products, setProducts] = useState(null as WooCommerceProduct[] | null);
  const [loading, setLoading] = useState(true);
  const [valuesMaybeUnsynced, setValuesMaybeUnsynced] = useState(false); //some values have to be calculated by woocommerce, so use this to show a warning that an update request must be made to make all values accurately reflect user changes
  const [removeLineItemIds, setRemoveLineItemIds] = useState([] as number[]); //list of line item IDs to remove from the woocommerce order when "save changes" is clicked
  const [ratedShippingMethods, setRatedShippingMethods] = useState(
    [] as RatedShippingMethod[]
  );
  const [helpMode, setHelpMode] = useState(false);

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
      const updatedMethods = await getUpdatedShippingMethods(order, products);
      setRatedShippingMethods(updatedMethods);

      //then check if we still have a valid shipping method selected
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

      //if not, force the first valid one to be selected instead; NEVER save a shipping method that isn't valid for the shipping address
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

      setValuesMaybeUnsynced(false);
    } catch (error) {
      setOrder(null);
      console.error(error);
    }
    setLoading(false);
  }

  async function loadOrder() {
    setLoading(true);
    try {
      const order = await getOrder();
      setOrder(order);

      const ids = order.lineItems.map((item) => item.productId);
      const products = await getProducts(ids);

      const methods = await getUpdatedShippingMethods(order, products);

      setRatedShippingMethods(methods);
      setProducts(products);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function getUpdatedShippingMethods(
    order: WooCommerceOrder,
    products: WooCommerceProduct[]
  ) {
    if (!products) throw new Error("No products");

    const totalWeight = products.reduce((accum, product) => {
      const matchingLineItem = order.lineItems.find(
        (item) => item.productId === product.id
      );
      const thisWeight = matchingLineItem
        ? matchingLineItem.quantity * +product.weight
        : 0;
      return accum + thisWeight;
    }, 0);

    const permittedShippingMethods = shippingMethods.filter((method) => {
      if (special?.allowUpsShippingToCanada) return method;
      return order?.shipping.country !== "CA" || !method.includes("UPS");
    });

    const {
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      postcode,
      country,
    } = order.shipping;

    const ratedMethods: RatedShippingMethod[] = await Promise.all(
      permittedShippingMethods.map(async (method) =>
        rateShippingMethod({
          firstName,
          lastName,
          addressLine1: address1,
          addressLine2: address2,
          city,
          stateCode: state,
          postalCode: postcode,
          countryCode: country,
          method,
          totalWeight,
        })
      )
    );

    return ratedMethods;
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
                  <ShippingInfo
                    order={order}
                    ratedShippingMethods={ratedShippingMethods}
                    setOrder={setOrder}
                    setValuesMaybeUnsynced={setValuesMaybeUnsynced}
                    permissions={permissions}
                  />
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
                  cannot be added back on this order page. Please{" "}
                  <a href={CONTACT_US_URL}>contact us</a> if you need help with
                  changing an order by following the link below.
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
