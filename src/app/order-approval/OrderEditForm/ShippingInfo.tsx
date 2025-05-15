import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { ChangeShippingInfoParams, RatedShippingMethod } from "./OrderEditForm";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

type Props = {
  order: WooCommerceOrder;
  ratedShippingMethods: RatedShippingMethod[];
  onChangeShippingInfo: (
    changes: ChangeShippingInfoParams,
    mayUnsyncValues?: boolean
  ) => void;
};
export function ShippingInfo({ order, onChangeShippingInfo }: Props) {
  return (
    <div>
      <h3>Shipping</h3>
      <div className={styles["flex-fields"]}>
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
          <label htmlFor="company">Company</label>
          <input
            type="text"
            name="company"
            id="company"
            onChange={(e) =>
              onChangeShippingInfo({ company: e.target.value }, true)
            }
            value={order.shipping.company}
          />
        </div>
        <div>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="text"
            name="phone"
            id="phone"
            onChange={(e) =>
              onChangeShippingInfo({ phone: e.target.value }, true)
            }
            value={order.shipping.phone}
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
      </div>
    </div>
  );
}
