import { getFieldValue } from "@/order-approval/checkoutFields";
import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { WebstoreCheckoutField } from "@prisma/client";

type Props = {
  order: WooCommerceOrder;
  fields: Omit<WebstoreCheckoutField, "webstoreId">[];
};
export function CheckoutFields({ order, fields }: Props) {
  return (
    <div>
      <h3>Additional Information</h3>
      <div className={styles["flex-fields"]}>
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.name}>{field.label}</label>

            {field.type === "text" && (
              <input
                type="text"
                name={field.name}
                id={field.name}
                value={getFieldValue(field.name, order)}
                onChange={() => {}}
                disabled
              />
            )}

            {field.type === "textarea" && (
              <textarea
                name={field.name}
                id={field.name}
                cols={40}
                rows={5}
                value={getFieldValue(field.name, order)}
                onChange={() => {}}
                disabled
              />
            )}

            {field.type === "select" && (
              <select
                name={field.name}
                id={field.name}
                value={getFieldValue(field.name, order)}
                disabled
              >
                {(field.options || "").split(/\s*\|\s*/g).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
