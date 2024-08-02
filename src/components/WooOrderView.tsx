"use client";

import { WooCommerceOrder } from "@/types/schema";
import { ChangeEvent, useEffect, useState } from "react";
import styles from "@/styles/WooOrderView.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getOrderAction, updateOrderAction } from "@/actions/orderWorkflow";

type Permission = "view" | "edit" | "hidden";
type Props = {
  orderId: number;
  storeUrl: string;
  permissions?: {
    shipping?: {
      method?: Permission;
    };
  };
  special?: {
    //highly specific settings for edge cases
    allowUpsShippingToCanada?: boolean;
  };
  shippingMethods: string[];
};
export function WooOrderView({
  orderId,
  storeUrl,
  permissions,
  shippingMethods,
  special,
}: Props) {
  const [order, setOrder] = useState(null as WooCommerceOrder | null);
  const [loading, setLoading] = useState(true);
  const [valuesMaybeUnsynced, setValuesMaybeUnsynced] = useState(false); //some values have to be calculated by woocommerce, so use this to show a warning that an update request must be made to make all values accurately reflect user changes
  const [removeLineItemIds, setRemoveLineItemIds] = useState([] as number[]); //list of line item IDs to remove from the woocommerce order when "save changes" is clicked
  const permittedShippingMethods = shippingMethods.filter((method) => {
    if (special?.allowUpsShippingToCanada) return method;
    return order?.shipping.country !== "CA" || !method.includes("UPS");
  });

  function onChangeLineItemQuantity(id: number, valueStr: string) {
    if (!order) return;

    const newOrder = { ...order };
    const item = newOrder.lineItems.find((item) => item.id === id);
    if (!item) return;

    item.quantity = +valueStr;
    item.total = (item.quantity * item.price).toFixed(2);

    setValuesMaybeUnsynced(true);
    setOrder(newOrder);
  }

  function onChangeShippingInfo(
    changes: {
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
      method?: string;
    },
    mayUnsyncValues = false
  ) {
    if (!order) return;

    setOrder({
      ...order,
      shipping: { ...order.shipping, ...changes },
      shippingLines: !changes.method
        ? order.shippingLines
        : [
            {
              id: order.shippingLines[0]?.id || 0,
              method_title: changes.method || "SHIPPING METHOD ERROR",
            },
          ],
    });
    if (mayUnsyncValues) setValuesMaybeUnsynced(true);
  }

  function setLineItemDelete(idToSet: number, willDelete: boolean) {
    const newRemoveLineItems = !willDelete
      ? [...removeLineItemIds].filter((id) => idToSet !== id)
      : [...removeLineItemIds, idToSet];
    setRemoveLineItemIds(newRemoveLineItems);
  }

  async function onClickSave() {
    if (!order) return;

    //woocommerce API requires us to set quantity to 0 for any line items we want to delete
    const lineItemsWithDeletions = order.lineItems.map((lineItem) => ({
      ...lineItem,
      quantity: removeLineItemIds.includes(lineItem.id) ? 0 : lineItem.quantity,
    }));

    setLoading(true);
    try {
      const updated = await updateOrderAction(storeUrl, {
        ...order,
        line_items: lineItemsWithDeletions,
        shipping: {
          ...order.shipping,
          first_name: order.shipping.firstName,
          last_name: order.shipping.lastName,
          address_1: order.shipping.address1,
          address_2: order.shipping.address2,
        },
        shipping_lines: order.shippingLines,
      });
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
      const order = await getOrderAction(orderId, storeUrl);
      setOrder(order);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrder();
  }, []);

  return (
    <div className={styles["main"]}>
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
                {order.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className={styles["line-item-x-container"]}>
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
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles["extra-details-flex"]}>
            <div>
              <h3>Shipping</h3>
              <div className={styles["shipping-fields"]}>
                <div>
                  <label htmlFor="first-name">First Name</label>
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    onChange={(e) =>
                      onChangeShippingInfo({ firstName: e.target.value })
                    }
                    value={order.shipping.firstName}
                  />
                </div>
                <div>
                  <label htmlFor="last-name">Last Name</label>
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    onChange={(e) =>
                      onChangeShippingInfo({ lastName: e.target.value })
                    }
                    value={order.shipping.lastName}
                  />
                </div>
                <div>
                  <label htmlFor="address1">Street Address (Line 1)</label>
                  <input
                    type="text"
                    name="address1"
                    id="address1"
                    onChange={(e) =>
                      onChangeShippingInfo({ address1: e.target.value }, true)
                    }
                    value={order.shipping.address1}
                  />
                </div>
                <div>
                  <label htmlFor="address2">Street Address (Line 2)</label>
                  <input
                    type="text"
                    name="address2"
                    id="address2"
                    onChange={(e) =>
                      onChangeShippingInfo({ address2: e.target.value }, true)
                    }
                    value={order.shipping.address2}
                  />
                </div>
                <div>
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    onChange={(e) =>
                      onChangeShippingInfo({ city: e.target.value }, true)
                    }
                    value={order.shipping.city}
                  />
                </div>
                <div>
                  <label htmlFor="state">State/County</label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    onChange={(e) =>
                      onChangeShippingInfo({ state: e.target.value }, true)
                    }
                    value={order.shipping.state}
                  />
                </div>
                <div>
                  <label htmlFor="zip">Zip Code</label>
                  <input
                    type="text"
                    name="zip"
                    id="zip"
                    onChange={(e) =>
                      onChangeShippingInfo({ postcode: e.target.value }, true)
                    }
                    value={order.shipping.postcode}
                  />
                </div>
                <div>
                  <label htmlFor="country">Country</label>
                  <select
                    name="country"
                    id="country"
                    value={order.shipping.country}
                    onChange={(e) =>
                      onChangeShippingInfo({ country: e.target.value }, true)
                    }
                  >
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                  </select>
                </div>
                {permissions?.shipping?.method === "edit" && (
                  <div>
                    <label htmlFor="shipping-method">Shipping Method</label>
                    <select
                      name="shipping-method"
                      id="shipping-method"
                      value={order.shippingLines[0]?.method_title}
                      onChange={(e) =>
                        onChangeShippingInfo({ method: e.target.value })
                      }
                    >
                      {permittedShippingMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className={styles["totals"]}>
              <div>Subtotal: ${order.subtotal}</div>
              <div>Total Tax: ${order.totalTax}</div>
              {/* <div>Shipping Total: ${order.shippingTotal}</div> */}
              <div className={styles["grand-total"]}>
                {`Grand Total: $${(+order.total - +order.shippingTotal).toFixed(
                  2
                )}`}
                <div className={styles["grand-total-asterisk"]}>*</div>
              </div>
              <div className={styles["info-box"]}>
                *Grand total is an estimate and does not include shipping cost.
              </div>
            </div>
          </div>
          <div className={styles["submit-row"]}>
            <button className={styles["submit"]} onClick={onClickSave}>
              Save All Changes
            </button>
            {(valuesMaybeUnsynced || removeLineItemIds.length > 0) && (
              <FontAwesomeIcon
                icon={faInfoCircle}
                className={styles["info-circle"]}
                size="2x"
                title="Some values may be out-of-sync. Save changes to update."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
