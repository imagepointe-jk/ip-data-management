"use client";

import { WooCommerceOrder } from "@/types/schema/woocommerce";
import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { LineItems } from "./LineItems";
import { FieldsSection } from "./FieldsSection";

type Props = {
  order: WooCommerceOrder;
};
export function OrderEditForm({ order }: Props) {
  return (
    <div className={styles["main"]}>
      <h2>Order {order.id}</h2>
      <div>Placed on {order.dateCreated.toLocaleDateString()}</div>
      <LineItems />
      <FieldsSection
        heading="Shipping"
        fields={[
          {
            id: "1",
            label: "First Name",
            type: "text",
            defaultValue: "John",
          },
          {
            id: "2",
            label: "Last Name",
            type: "text",
          },
          {
            id: "5",
            label: "Last Name",
            type: "text",
          },
          {
            id: "6",
            label: "Last Name",
            type: "text",
          },
          {
            id: "7",
            label: "Last Name",
            type: "text",
          },
          {
            id: "8",
            label: "Last Name",
            type: "text",
          },
          {
            id: "3",
            label: "Info",
            type: "textarea",
          },
          {
            id: "4",
            label: "Options",
            type: "select",
            options: [
              {
                label: "Dog",
                value: "dog",
              },
              {
                label: "Cat",
                value: "cat",
              },
              {
                label:
                  "A really long option written extra long to take up lots and lots of space",
                value: "long",
              },
            ],
          },
        ]}
      />
    </div>
  );
}
