import { CONTACT_US_URL } from "@/constants";
import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { RatedShippingMethod } from "./OrderEditForm";

type Props = {
  order: WooCommerceOrder;
  setOrder: (order: WooCommerceOrder) => void;
  setValuesMaybeUnsynced: (val: boolean) => void;
  ratedShippingMethods: RatedShippingMethod[];
};
export function ShippingMethods({
  order,
  setOrder,
  setValuesMaybeUnsynced,
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
                  checked={order.shippingLines[0]?.method_title === method.name}
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
        *Shipping costs listed are estimates only. Actual shipping charges may
        be more or less than shown. Please allow 24-48 business hours (M-F) to
        process the order plus estimated delivery time for your order to arrive.
      </div>
    </div>
  );
}
