import { useState } from "react";
import styles from "@/styles/orderImport/orderImport.module.css";
import { ValidatedData } from "./ValidatedData";
import { OrderImportDTO } from "@/types/schema/orders";
import { OrderImportValidationStatus } from "./orderImport";

type Props = {
  pendingUpload: OrderImportDTO;
  // ok: boolean;
  validationStatus?: OrderImportValidationStatus;
};
export function PendingOrderUploadDisplay({
  pendingUpload,
  validationStatus,
}: Props) {
  const { billing, shipping, lineItems, couponCode, customerNote } =
    pendingUpload;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={styles["pending-upload-container"]}
      style={{ padding: "10px", border: "1px solid gray" }}
    >
      <div
        className={styles["expandable-headline"]}
        onClick={() => setExpanded(!expanded)}
      >
        Order for {billing.firstName || "NO_FIRST_NAME"}{" "}
        {billing.lastName || "NO_LAST_NAME"}
        <span
          className={`${styles["validation-notice"]} ${styles[validationStatus?.overallStatus === "ok" ? "data-ok" : "data-missing"]}`}
        >
          {validationStatus?.overallStatus === "ok" ? "ok" : "data missing"}
        </span>
      </div>
      {expanded && (
        <div>
          <div className={styles["pending-upload-info-frames-flex"]}>
            <div className={styles["pending-upload-info-frame"]}>
              <div style={{ fontWeight: "bold" }}>Shipping Information</div>
              <div>
                First Name: <ValidatedData value={shipping.firstName} />
              </div>
              <div>
                Last Name: <ValidatedData value={shipping.lastName} />
              </div>
              <div>
                Address Line 1: <ValidatedData value={shipping.addressLine1} />
              </div>
              <div>Address Line 2: {shipping.addressLine2 || "(n/a)"}</div>
              <div>
                City: <ValidatedData value={shipping.city} />
              </div>
              <div>
                State: <ValidatedData value={shipping.state} />
              </div>
              <div>
                Zip: <ValidatedData value={shipping.zip} />
              </div>
              <div>
                Country: <ValidatedData value={shipping.country} />
              </div>
              {/* <div>
                Method ID: <ValidatedData value={shipping.method} />
              </div> */}
            </div>
            <div className={styles["pending-upload-info-frame"]}>
              <div style={{ fontWeight: "bold" }}>Billing Information</div>
              <div>
                First Name: <ValidatedData value={billing.firstName} />
              </div>
              <div>
                Last Name: <ValidatedData value={billing.lastName} />
              </div>
              <div>
                Email: <ValidatedData value={billing.email} />
              </div>
              <div>Phone: {billing.phone || "(n/a)"}</div>
              <div>
                Address Line 1: <ValidatedData value={billing.addressLine1} />
              </div>
              <div>Address Line 2: {billing.addressLine2 || "(n/a)"}</div>
              <div>
                City: <ValidatedData value={billing.city} />
              </div>
              <div>
                State: <ValidatedData value={billing.state} />
              </div>
              <div>
                Zip: <ValidatedData value={billing.zip} />
              </div>
              <div>
                Country: <ValidatedData value={billing.country} />
              </div>
            </div>
            <div className={styles["pending-upload-info-frame"]}>
              <div style={{ fontWeight: "bold" }}>Additional Information</div>
              <div>Coupon Code: {couponCode || "(n/a)"}</div>
              <div>
                Customer Note: {customerNote ? `"${customerNote}"` : "(n/a)"}
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>SKU</th>
                <th>Quantity</th>
                <th>Product ID</th>
                <th>Variation ID</th>
                <th>{""}</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((lineItem) => (
                <tr key={lineItem.sku}>
                  <td>{lineItem.sku}</td>
                  <td>{lineItem.quantity}</td>
                  <td>{lineItem.productId}</td>
                  <td>{lineItem.variationId}</td>
                  <td>
                    {/* Show the warning message if there's any corresponding issue found for this line item in the status object */}
                    {!!validationStatus?.lineItems.find(
                      (lineItemStatus) =>
                        lineItemStatus.sku === lineItem.sku &&
                        lineItemStatus.validationStatus !== "ok",
                    ) && (
                      <span
                        className={`${styles["validation-notice"]} ${styles["data-missing"]}`}
                      >
                        not found
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lineItems.length === 0 && (
            <div
              className={`${styles["validation-notice"]} ${styles["data-missing"]}`}
              style={{ display: "inline-block" }}
            >
              no line items
            </div>
          )}
        </div>
      )}
    </div>
  );
}
