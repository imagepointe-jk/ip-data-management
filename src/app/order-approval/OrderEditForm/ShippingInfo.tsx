import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { Dispatch, SetStateAction } from "react";
import { Permission, RatedShippingMethod } from "./OrderEditForm";
import { CONTACT_US_URL } from "@/constants";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

type Props = {
  order: WooCommerceOrder;
  setOrder: Dispatch<SetStateAction<WooCommerceOrder | null>>;
  setValuesMaybeUnsynced: (b: boolean) => void;
  permissions?: {
    shipping?: {
      method?: Permission;
    };
  };
  ratedShippingMethods: RatedShippingMethod[];
};
export function ShippingInfo({
  order,
  setOrder,
  setValuesMaybeUnsynced,
  permissions,
  ratedShippingMethods,
}: Props) {
  const validShippingMethods = ratedShippingMethods.filter(
    (method) =>
      method.total !== null &&
      (method.statusCode === 200 || method.statusCode === 429)
  );
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
    if (changes.method !== undefined) {
      //stop any invalid shipping method changes from taking place
      const isValid = !!validShippingMethods.find(
        (method) => method.name === changes.method
      );
      if (!isValid) changes.method = undefined;
    }

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

  return (
    <div>
      <h3>Shipping</h3>
      <div className={styles["shipping-fields"]}>
        <div>
          {/* Name */}

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
            onChange={(e) => onChangeShippingInfo({ lastName: e.target.value })}
            value={order.shipping.lastName}
          />
        </div>

        {/* Address */}

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

        {/* Shipping Method */}

        {permissions?.shipping?.method === "edit" && (
          <div className={styles["shipping-methods-parent"]}>
            <div className={styles["shipping-methods-container"]}>
              <h4>Shipping Method</h4>
              {validShippingMethods.length === 0 && (
                <div style={{ marginBottom: "10px" }}>
                  No valid shipping methods found. Please check your shipping
                  information for typos, misspellings, etc. Otherwise, please{" "}
                  <a href={CONTACT_US_URL}>contact us</a> for assistance.
                </div>
              )}
              {ratedShippingMethods.map((method) => {
                const isValid = !!validShippingMethods.find(
                  (validMethod) => validMethod.name === method.name
                );
                return (
                  <div key={method.name}>
                    <label
                      htmlFor={method.name}
                      className={
                        !isValid ? styles["shipping-method-invalid"] : undefined
                      }
                    >
                      <input
                        type="radio"
                        name="shipping-method"
                        id={method.name}
                        value={method.name}
                        checked={
                          order.shippingLines[0]?.method_title === method.name
                        }
                        onChange={(e) =>
                          onChangeShippingInfo({ method: e.target.value })
                        }
                        disabled={!isValid}
                      />
                      {method.name} {isValid && <>(${method.total})</>}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className={styles["info-box"]}>
              *Shipping costs listed are estimates only. Actual shipping charges
              may be more or less than shown. Please allow 24-48 business hours
              (M-F) to process the order plus estimated delivery time for your
              order to arrive.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
