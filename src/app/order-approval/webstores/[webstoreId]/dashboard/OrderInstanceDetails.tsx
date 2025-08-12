import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/approverDashboard.module.css";
import { OrderWorkflowInstance, WebstoreCheckoutField } from "@prisma/client";

type Props = {
  order: WooCommerceOrder;
  instance: OrderWorkflowInstance;
  checkoutFields: WebstoreCheckoutField[];
};
export function OrderInstanceDetails({
  order,
  instance,
  checkoutFields,
}: Props) {
  const totalWithoutShipping = +order.subtotal + +order.totalTax;

  function getFieldValue(name: string) {
    if (["order_comments", "customer_note"].includes(name))
      return order.customerNote || "n/a";

    return order.metaData.find((meta) => meta.key === name)?.value || "n/a";
  }

  return (
    <div className={styles["order-details-flex"]}>
      <div className={styles["order-details-main-container"]}>
        <table className={styles["line-items-table"]}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.lineItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>Total Tax: ${order.totalTax}</div>
        <div>Total (w/o shipping): ${totalWithoutShipping.toFixed(2)}</div>
      </div>
      <div>
        <div className={styles["order-details-heading"]}>
          Shipping Information
        </div>
        <div className={styles["order-details-fields-container"]}>
          <div>
            <span className={styles["order-details-field-label"]}>
              First Name:{" "}
            </span>{" "}
            {order.shipping.firstName}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>
              Last Name:{" "}
            </span>{" "}
            {order.shipping.lastName}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>
              Address Line 1:{" "}
            </span>{" "}
            {order.shipping.address1}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>
              Address Line 2:{" "}
            </span>{" "}
            {order.shipping.address2}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>City: </span>{" "}
            {order.shipping.city}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>State: </span>{" "}
            {order.shipping.state}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>
              Country:{" "}
            </span>{" "}
            {order.shipping.country}
          </div>
          <div>
            <span className={styles["order-details-field-label"]}>
              Zip Code:{" "}
            </span>{" "}
            {order.shipping.postcode}
          </div>
        </div>
      </div>
      <div>
        <div className={styles["order-details-heading"]}>
          Additional Information
        </div>
        <div className={styles["order-details-fields-container"]}>
          <div>
            <span className={styles["order-details-field-label"]}>
              Purchaser Name:{" "}
            </span>{" "}
            {instance.purchaserName}
          </div>
          {checkoutFields.map((field) => (
            <div key={field.id}>
              <span className={styles["order-details-field-label"]}>
                {field.label}:{" "}
              </span>
              {getFieldValue(field.name)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
