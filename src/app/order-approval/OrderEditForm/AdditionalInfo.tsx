import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { FieldsSection } from "./FieldsSection";
import { WebstoreCheckoutField } from "@prisma/client";
import { DraftFunction, Updater } from "use-immer";
import { MetaData } from "./OrderEditForm";

type Props = {
  order: WooCommerceOrder;
  checkoutFields: WebstoreCheckoutField[];
  metaDataToAdd: MetaData[];
  modifyOrder: (
    arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>
  ) => void;
  modifyMetaDataToAdd: (newMetaDataToAdd: MetaData[]) => void;
};
export function AdditionalInfo({
  order,
  checkoutFields,
  metaDataToAdd,
  modifyOrder,
  modifyMetaDataToAdd,
}: Props) {
  function getFieldValue(fieldName: string) {
    //customer_note is not in the WC metadata like other custom checkout fields,
    //but for flexibility, go ahead and act like it is
    if (["order_comments", "customer_note"].includes(fieldName))
      return order.customerNote;

    //see if a value can be found in the existing order metadata using fieldName as the key
    const matchingMetaData = order.metaData.find(
      (meta) => meta.key === fieldName
    );
    if (matchingMetaData) return matchingMetaData.value;

    //if we get here, the key is not in the existing metadata, but it might be in the metadata
    //we're preparing to add
    const matchingAdditionalMetaData = metaDataToAdd.find(
      (meta) => meta.key === fieldName
    );
    return matchingAdditionalMetaData?.value || "";
  }

  function onChangeField(key: string, value: string) {
    //handle comments field differently since WooCommerce doesn't put it in the metadata
    if (key === "order_comments") {
      modifyOrder((draft) => {
        if (draft) draft.customerNote = value;
      });
      return;
    }

    //if a metadata with the given key already exists, edit it directly and then exit
    const metaDataExists = order.metaData.find((meta) => meta.key === key);
    if (metaDataExists) {
      modifyOrder((draft) => {
        if (!draft) return;

        const metaDataMatch = draft.metaData.find((meta) => meta.key === key);
        if (!metaDataMatch) return;
        metaDataMatch.value = value;
      });
      return;
    }

    //if we get here, a metadata with the given key does NOT exist in the data received from WooCommerce
    //first check if we've already the incoming key already exists in what we're going to add
    const additionalMetaDataExists = !!metaDataToAdd.find(
      (meta) => meta.key === key
    );
    //if it does, there is still a bit more to consider
    if (additionalMetaDataExists) {
      if (!value) {
        //if the user erased the value, we want to forget about this particular additional metadata
        //so it won't be included in the POST to add additional metadata
        modifyMetaDataToAdd(metaDataToAdd.filter((meta) => meta.key !== key));
      } else {
        //but if there is a value, update the existing additional metadata
        const newAdditionalMetaData = metaDataToAdd.map((meta) =>
          meta.key === key ? { key, value } : meta
        );
        modifyMetaDataToAdd(newAdditionalMetaData);
      }
    } else {
      //the incoming key does NOT already exist in what we're going to add, so add it now
      modifyMetaDataToAdd([...metaDataToAdd, { key, value }]);
    }
  }

  return (
    <FieldsSection
      heading="Additional Information"
      fields={checkoutFields.map((field) => {
        const options = field.options
          ? field.options
              .split(/\s*\|\s*/g)
              .map((option) => ({ label: option, value: option }))
          : undefined;
        const emph = "emph";
        const style = field.style === emph ? emph : undefined;

        return {
          id: `${field.id}`,
          label: field.label,
          type: field.type,
          value: getFieldValue(field.name),
          style,
          options,
          onChange: (value) => onChangeField(field.name, value),
        };
      })}
    />
  );
}
