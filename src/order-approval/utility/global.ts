import { cleanShippingMethodName } from "@/app/order-approval/OrderEditForm/helpers/shipping";
import { DiffStatus } from "@/types/schema/misc";
import {
  WooCommerceOrder,
  WooCommerceOrderDiff,
} from "@/types/schema/woocommerce";

export function createOrderDiff(
  initialOrder: WooCommerceOrder,
  newOrder: WooCommerceOrder,
  metaDataToAdd: { key: string; value: string }[]
): WooCommerceOrderDiff {
  return {
    customerNote: diff(initialOrder.customerNote, newOrder.customerNote),
    lineItems: newOrder.lineItems.map((item) => {
      const initialOrderItem = initialOrder.lineItems.find(
        (initialItem) => initialItem.id === item.id
      );
      return {
        id: item.id,
        quantity: diff(initialOrderItem?.quantity, item.quantity),
      };
    }),
    shipping: {
      firstName: diff(
        initialOrder.shipping.firstName,
        newOrder.shipping.firstName
      ),
      lastName: diff(
        initialOrder.shipping.lastName,
        newOrder.shipping.lastName
      ),
      company: diff(initialOrder.shipping.company, newOrder.shipping.company),
      phone: diff(initialOrder.shipping.phone, newOrder.shipping.phone),
      address1: diff(
        initialOrder.shipping.address1,
        newOrder.shipping.address1
      ),
      address2: diff(
        initialOrder.shipping.address2,
        newOrder.shipping.address2
      ),
      city: diff(initialOrder.shipping.city, newOrder.shipping.city),
      state: diff(initialOrder.shipping.state, newOrder.shipping.state),
      postcode: diff(
        initialOrder.shipping.postcode,
        newOrder.shipping.postcode
      ),
      country: diff(initialOrder.shipping.country, newOrder.shipping.country),
    },
    shippingMethod: diff(
      cleanShippingMethodName(`${initialOrder.shippingLines[0]?.method_title}`),
      cleanShippingMethodName(`${newOrder.shippingLines[0]?.method_title}`)
    ),
    metaData: [
      ...newOrder.metaData.map((item) => {
        const initialOrderItem = initialOrder.metaData.find(
          (initialItem) => initialItem.key === item.key
        );
        return {
          key: item.key,
          value: diff(item.value, initialOrderItem?.value),
        };
      }),
      ...metaDataToAdd.map((item) => {
        const c: DiffStatus = "changed";
        return {
          key: item.key,
          value: c,
        };
      }),
    ],
  };
}

function diff(val1: any, val2: any): DiffStatus {
  return val1 === val2 ? "unchanged" : "changed";
}

//currently this returns true if anything is changed, EXCEPT that it disregards the "purchase_order" metadata, per a feature request.
//will need to be expanded if we want the emails to depend on more conditions or different conditions per webstore.
export function shouldSendOrderUpdatedEmails(
  initialOrder: WooCommerceOrder,
  updatedOrder: WooCommerceOrder,
  metaDataAdded: { key: string; value: string }[]
) {
  const diff = createOrderDiff(initialOrder, updatedOrder, metaDataAdded);
  const relevantDiffs = [
    diff.customerNote,
    diff.shippingMethod,
    ...diff.lineItems.map((item) => item.quantity),
    ...diff.metaData
      .filter((item) => item.key !== "purchase_order")
      .map((item) => item.value),
    diff.shipping.firstName,
    diff.shipping.lastName,
    diff.shipping.address1,
    diff.shipping.address2,
    diff.shipping.city,
    diff.shipping.state,
    diff.shipping.postcode,
    diff.shipping.country,
    diff.shipping.company,
    diff.shipping.phone,
  ];
  const anyRelevantChanges = !!relevantDiffs.find((diff) => diff === "changed");
  return anyRelevantChanges;
}
