import styles from "@/styles/orderApproval/new/orderEditForm/shipping.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import {
  cleanShippingMethodName,
  findMatchingShippingMethod,
  RatedShippingMethod,
} from "./helpers/shipping";
import { CONTACT_US_URL } from "@/constants";
import { DraftFunction } from "use-immer";

type Props = {
  order: WooCommerceOrder;
  setOrder: (arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>) => void;
  ratedShippingMethods: RatedShippingMethod[];
};
export function ShippingMethods({
  order,
  setOrder,
  ratedShippingMethods,
}: Props) {
  const selectedMethod = order.shippingLines[0]?.method_title || "";
  const matchingMethod = findMatchingShippingMethod(
    selectedMethod,
    ratedShippingMethods
  );
  const validMethods = ratedShippingMethods.filter(
    (method) => method.total !== null
  );

  function onChangeMethod(method: RatedShippingMethod) {
    setOrder((draft) => {
      const shippingLine = draft.shippingLines[0];
      if (!shippingLine) return;
      shippingLine.method_title = cleanShippingMethodName(method.name);
    });
  }

  return (
    <div className={styles["main"]}>
      <h4>Available Shipping Methods</h4>
      {validMethods.length === 0 && (
        <p>
          No valid shipping methods found. Please check your shipping
          information for typos, misspellings, etc. Otherwise, please{" "}
          <a href={CONTACT_US_URL}>contact us</a> for assistance.
        </p>
      )}
      {ratedShippingMethods.map((method) => {
        const valid = method.total !== null;
        return (
          <label
            key={method.id}
            className={`${styles["row"]} ${!valid ? styles["invalid"] : ""}`}
          >
            <input
              type="radio"
              checked={matchingMethod?.id === method.id}
              onChange={() => onChangeMethod(method)}
              disabled={!valid}
            />
            <span dangerouslySetInnerHTML={{ __html: method.name }}></span>
          </label>
        );
      })}
    </div>
  );
}
