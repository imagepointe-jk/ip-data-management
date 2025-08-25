import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { RatedShippingMethod } from "./helpers/shipping";
import { ShippingMethods } from "./ShippingMethods";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { DraftFunction } from "use-immer";

type Props = {
  order: WooCommerceOrder;
  modifyOrder: (
    arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>
  ) => void;
  ratedShippingMethods: RatedShippingMethod[];
};
export function BeforeSubmitArea({
  order,
  modifyOrder,
  ratedShippingMethods,
}: Props) {
  return (
    <div>
      <div className={styles["before-submit-area-flex"]}>
        <ShippingMethods
          order={order}
          modifyOrder={modifyOrder}
          ratedShippingMethods={ratedShippingMethods}
        />
        <div className={styles["info-box"]}>
          *Shipping costs listed are estimates only. Actual shipping charges may
          be more or less than shown. Please allow 24-48 business hours (M-F) to
          process the order plus estimated delivery time for your order to
          arrive.
        </div>
      </div>
      <div className={styles["edit-help-text"]}>
        <FontAwesomeIcon icon={faInfoCircle} style={{ color: "#006ac6" }} /> You
        may edit quantities, shipping methods and remove products if needed.
        Please keep in mind once a product is removed it cannot be added back on
        this order page. Please contact us if you need help with changing an
        order by following the link below.
      </div>
    </div>
  );
}
