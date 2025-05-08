import { CONTACT_US_URL } from "@/constants";
import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { ChangeShippingInfoParams, RatedShippingMethod } from "./OrderEditForm";

type Props = {
  order: WooCommerceOrder;
  ratedShippingMethods: RatedShippingMethod[];
  onChangeShippingInfo: (
    changes: ChangeShippingInfoParams,
    mayUnsyncValues?: boolean
  ) => void;
};
export function ShippingMethods({
  order,
  ratedShippingMethods,
  onChangeShippingInfo,
}: Props) {
  const validShippingMethods = ratedShippingMethods.filter(
    (method) =>
      method.total !== null &&
      (method.statusCode === 200 || method.statusCode === 429)
  );

  function compareShippingMethodTitles(title1: string, title2: string) {
    const cleaned1 = title1.replace("™", "&#8482;").replace("®", "&#174;");
    const cleaned2 = title2.replace("™", "&#8482;").replace("®", "&#174;");
    return cleaned1 === cleaned2;
  }

  return (
    <div className={styles["shipping-methods-parent"]}>
      <div className={styles["shipping-methods-container"]}>
        <h4>Available Shipping Methods</h4>
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
                  checked={compareShippingMethodTitles(
                    order.shippingLines[0]?.method_title || "",
                    method.name
                  )}
                  onChange={(e) =>
                    onChangeShippingInfo({ method: e.target.value })
                  }
                  disabled={!isValid}
                />
                {/* correctly render escaped characters present in the method names */}
                <span
                  dangerouslySetInnerHTML={{
                    __html: method.name,
                  }}
                ></span>
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
