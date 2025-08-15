import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { FieldsSection } from "./FieldsSection";
import { DraftFunction } from "use-immer";

type Props = {
  order: WooCommerceOrder;
  modifyOrder: (
    arg: WooCommerceOrder | DraftFunction<WooCommerceOrder>
  ) => void;
};
export function ShippingInfo({ order, modifyOrder }: Props) {
  return (
    <FieldsSection
      heading="Shipping"
      fields={[
        {
          id: "1",
          label: "First Name",
          type: "text",
          value: order.shipping.firstName,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.firstName = value;
            }),
        },
        {
          id: "2",
          label: "Last Name",
          type: "text",
          value: order.shipping.lastName,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.lastName = value;
            }),
        },
        {
          id: "3",
          label: "Street Address (Line 1)",
          type: "text",
          value: order.shipping.address1,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.address1 = value;
            }),
        },
        {
          id: "4",
          label: "Street Address (Line 2)",
          type: "text",
          value: order.shipping.address2,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.address2 = value;
            }),
        },
        {
          id: "5",
          label: "Company",
          type: "text",
          value: order.shipping.company,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.company = value;
            }),
        },
        {
          id: "6",
          label: "Phone Number",
          type: "text",
          value: order.shipping.phone,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.phone = value;
            }),
        },
        {
          id: "7",
          label: "City",
          type: "text",
          value: order.shipping.city,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.city = value;
            }),
        },
        {
          id: "8",
          label: "State/County",
          type: "text",
          value: order.shipping.state,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.state = value;
            }),
        },
        {
          id: "9",
          label: "Zip Code",
          type: "text",
          value: order.shipping.postcode,
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.postcode = value;
            }),
        },
        {
          id: "10",
          label: "Country",
          type: "select",
          value: order.shipping.country,
          options: [
            {
              label: "US",
              value: "US",
            },
            {
              label: "CA",
              value: "CA",
            },
          ],
          onChange: (value) =>
            modifyOrder((draft) => {
              draft.shipping.country = value;
            }),
        },
      ]}
    />
  );
}
