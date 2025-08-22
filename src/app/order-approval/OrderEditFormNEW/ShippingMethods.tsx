import styles from "@/styles/orderApproval/new/orderEditForm/shipping.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import {
  findMatchingShippingMethod,
  RatedShippingMethod,
} from "./helpers/shipping";

type Props = {
  order: WooCommerceOrder;
  ratedShippingMethods: RatedShippingMethod[];
};
export function ShippingMethods({ order, ratedShippingMethods }: Props) {
  const selectedMethod = order.shippingLines[0]?.method_title || "";
  const matchingMethod = findMatchingShippingMethod(
    selectedMethod,
    ratedShippingMethods
  );

  return (
    <div className={styles["main"]}>
      <h4>Available Shipping Methods</h4>
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
              disabled={!valid}
            />
            <span dangerouslySetInnerHTML={{ __html: method.name }}></span>
          </label>
        );
      })}
    </div>
  );
}
