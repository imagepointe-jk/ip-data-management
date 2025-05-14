import styles from "@/styles/orderApproval/orderEditForm.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { WebstoreCheckoutField } from "@prisma/client";
import { Updater } from "use-immer";
import { MetaData } from "./OrderEditForm";

type Props = {
  order: WooCommerceOrder;
  setOrder: Updater<WooCommerceOrder | null>;
  fields: Omit<WebstoreCheckoutField, "webstoreId">[];
  metaDataToAdd: MetaData[];
  setMetaDataToAdd: (val: MetaData[]) => void;
};
export function CheckoutFields({
  order,
  setOrder,
  fields,
  metaDataToAdd,
  setMetaDataToAdd,
}: Props) {
  function onChangeField(key: string, value: string) {
    //handle comments field differently since WooCommerce doesn't put it in the metadata
    if (key === "order_comments") {
      setOrder((draft) => {
        if (draft) draft.customerNote = value;
      });
      return;
    }

    //if a metadata with the given key already exists, edit it directly and then exit
    const metaDataExists = order.metaData.find((meta) => meta.key === key);
    if (metaDataExists) {
      setOrder((draft) => {
        if (!draft) return;

        const metaDataMatch = draft.metaData.find((meta) => meta.key === key);
        if (!metaDataMatch) return;
        metaDataMatch.value = value;
      });
      return;
    }

    //if we get here, a metadata with the given key does NOT exist in the data received from WooCommerce
    //WC requires us to add it in a separate POST request, so keep track of what will be sent in "metaDataToAdd"
    const additionalMetaDataExists = !!metaDataToAdd.find(
      (meta) => meta.key === key
    );
    if (additionalMetaDataExists) {
      if (!value) {
        //if the user erased the value, we want to forget about this particular additional metadata
        setMetaDataToAdd(metaDataToAdd.filter((meta) => meta.key !== key));
      } else {
        //but if there is a value, update the existing additional metadata
        const newAdditionalMetaData = metaDataToAdd.map((meta) =>
          meta.key === key ? { key, value } : meta
        );
        setMetaDataToAdd(newAdditionalMetaData);
      }
    } else {
      setMetaDataToAdd([...metaDataToAdd, { key, value }]);
    }
  }

  function getFieldValue(fieldName: string) {
    if (["order_comments", "customer_note"].includes(fieldName))
      return order.customerNote;

    const matchingMetaData = order.metaData.find(
      (meta) => meta.key === fieldName
    );
    if (matchingMetaData) return matchingMetaData.value;

    const matchingAdditionalMetaData = metaDataToAdd.find(
      (meta) => meta.key === fieldName
    );
    return matchingAdditionalMetaData?.value || "";
  }

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
                value={getFieldValue(field.name)}
                onChange={(e) => onChangeField(field.name, e.target.value)}
              />
            )}

            {field.type === "textarea" && (
              <textarea
                name={field.name}
                id={field.name}
                cols={40}
                rows={5}
                value={getFieldValue(field.name)}
                onChange={(e) => onChangeField(field.name, e.target.value)}
              />
            )}

            {field.type === "select" && (
              <select
                name={field.name}
                id={field.name}
                value={getFieldValue(field.name)}
                onChange={(e) => onChangeField(field.name, e.target.value)}
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
