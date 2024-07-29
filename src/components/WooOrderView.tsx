"use client";

import { getOrder, updateOrder } from "@/fetch/woocommerce";
import { WooCommerceOrder } from "@/types/schema";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { useEffect, useState } from "react";
import styles from "@/styles/WooOrderView.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

type Props = {
  orderId: number;
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
};
export function WooOrderView({ orderId, storeUrl, apiKey, apiSecret }: Props) {
  const [order, setOrder] = useState(null as WooCommerceOrder | null);
  const [loading, setLoading] = useState(true);
  const [changesMade, setChangesMade] = useState(false);

  function onChangeLineItemQuantity(id: number, valueStr: string) {
    if (!order) return;

    const newOrder = { ...order };
    const item = newOrder.lineItems.find((item) => item.id === id);
    if (!item) return;

    item.quantity = +valueStr;
    item.total = (item.quantity * item.price).toFixed(2);

    setChangesMade(true);
    setOrder(newOrder);
  }

  async function onClickSave() {
    if (!order) return;

    setLoading(true);
    try {
      const updateResponse = await updateOrder(storeUrl, apiKey, apiSecret, {
        ...order,
        line_items: order.lineItems,
      });
      const updateJson = await updateResponse.json();
      const parsed = parseWooCommerceOrderJson(updateJson);
      setOrder(parsed);
      setChangesMade(false);
    } catch (error) {
      setOrder(null);
      console.error(error);
    }
    setLoading(false);
  }

  async function loadOrder() {
    setLoading(true);
    try {
      const orderResponse = await getOrder(
        orderId,
        storeUrl,
        apiKey,
        apiSecret
      );
      const orderJson = await orderResponse.json();
      const parsed = parseWooCommerceOrderJson(orderJson);
      setOrder(parsed);
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
      {!order && loading && <div>Loading order...</div>}
      {!order && !loading && <div>Error finding order.</div>}
      {order && loading && (
        <div className={styles["update-overlay"]}>
          <div>Updating order...</div>
        </div>
      )}
      {order && (
        <>
          <h2>Order {orderId}</h2>
          <div>Placed on {order.dateCreated.toLocaleDateString()}</div>
          <div className={styles["table-scroll"]}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Tax</th>
                </tr>
              </thead>
              <tbody>
                {order.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <input
                        type="number"
                        onChange={(e) =>
                          onChangeLineItemQuantity(item.id, e.target.value)
                        }
                        defaultValue={item.quantity}
                      />
                    </td>
                    <td>${item.total}</td>
                    <td>${item.totalTax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles["extra-details-flex"]}>
            <div>
              <h3>Shipping</h3>
              <div>
                <label htmlFor="first-name">First Name</label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  defaultValue={order.shipping.firstName}
                />
              </div>
              <div>
                <label htmlFor="last-name">Last Name</label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  defaultValue={order.shipping.lastName}
                />
              </div>
              <div>
                <label htmlFor="address1">Street Address (Line 1)</label>
                <input
                  type="text"
                  name="address1"
                  id="address1"
                  defaultValue={order.shipping.address1}
                />
              </div>
              <div>
                <label htmlFor="address2">Street Address (Line 2)</label>
                <input
                  type="text"
                  name="address2"
                  id="address2"
                  defaultValue={order.shipping.address2}
                />
              </div>
              <div>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  defaultValue={order.shipping.city}
                />
              </div>
              <div>
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  defaultValue={order.shipping.state}
                />
              </div>
              <div>
                <label htmlFor="zip">Zip Code</label>
                <input
                  type="text"
                  name="zip"
                  id="zip"
                  defaultValue={order.shipping.postcode}
                />
              </div>
            </div>
            <div className={styles["totals"]}>
              <div>Subtotal: ${order.subtotal}</div>
              <div>Total Tax: ${order.totalTax}</div>
              <div>Shipping Total: ${order.shippingTotal}</div>
              <div className={styles["grand-total"]}>
                Grand Total: ${order.total}
              </div>
            </div>
          </div>
          <div className={styles["submit-row"]}>
            <button className={styles["submit"]} onClick={onClickSave}>
              Save All Changes
            </button>
            {changesMade && (
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
