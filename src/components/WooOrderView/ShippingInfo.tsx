import styles from "@/styles/WooOrderView.module.css";
import { WooCommerceOrder } from "@/types/schema";
import { Dispatch, SetStateAction } from "react";
import { Permission, RatedShippingMethod } from "./WooOrderView";

type Props = {
  order: WooCommerceOrder;
  setOrder: Dispatch<SetStateAction<WooCommerceOrder | null>>;
  setValuesMaybeUnsynced: (b: boolean) => void;
  permissions?: {
    shipping?: {
      method?: Permission;
    };
  };
  //   permittedShippingMethods: string[];
  ratedShippingMethods: RatedShippingMethod[];
};
export function ShippingInfo({
  order,
  setOrder,
  setValuesMaybeUnsynced,
  permissions,
  ratedShippingMethods,
}: //   permittedShippingMethods,
Props) {
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
          <div>
            <label htmlFor="shipping-method">Shipping Method</label>
            <select
              name="shipping-method"
              id="shipping-method"
              value={order.shippingLines[0]?.method_title}
              onChange={(e) => onChangeShippingInfo({ method: e.target.value })}
            >
              {ratedShippingMethods.map((method) => (
                <option key={method.name} value={method.name}>
                  {method.name} (${method.total})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
