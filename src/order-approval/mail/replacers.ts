import { OrderWorkflowEmailContext } from "@/types/schema/orderApproval";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { runHandlebarsTemplate } from "@/utility/mail";
import { createApprovalFrontEndUrl } from "@/utility/url";

type Params = {
  text: string;
  context: OrderWorkflowEmailContext;
};
export function insertBreak({ text }: Params) {
  return text.replace(/\r|\r\n|\n/g, "<br>");
}

export function insertOrderDetails({
  text,
  context: {
    order,
    workflow: {
      webstore: { checkoutFields },
    },
  },
}: Params) {
  return text.replace(/\{order\}/gi, () => {
    const checkoutValues = checkoutFields.map((field) => ({
      label: field.label,
      value: getCheckoutFieldValue(field.name, order) || "N/A",
    }));
    const feeLinesSubtotal = order.feeLines.reduce(
      (accum, item) => accum + +item.total,
      0
    );
    const totalNoShipping =
      +order.subtotal + feeLinesSubtotal + +order.totalTax;

    const output = runHandlebarsTemplate(
      "src/order-approval/mail/orderDetails.hbs",
      {
        ...order,
        totalNoShipping,
        checkoutValues,
        shippingMethod: order.shippingLines[0]?.method_title,
      }
    );
    return output;
  });
}

export function insertUserName({ text, context: { userName } }: Params) {
  return text.replace(/\{user\}/gi, () => userName);
}

export function insertApproveLink({
  text,
  context: {
    accessCode,
    workflow: { webstore },
  },
}: Params) {
  return text.replace(
    /\{approve\}/gi,
    `<a href="${createApprovalFrontEndUrl(
      webstore.url,
      accessCode?.guid || "NO_ACCESS_CODE_FOUND",
      "approve"
    )}">Approve</a>`
  );
}

export function insertDenyLink({
  text,
  context: {
    accessCode,
    workflow: { webstore },
  },
}: Params) {
  return text.replace(
    /\{deny\}/gi,
    `<a href="${createApprovalFrontEndUrl(
      webstore.url,
      accessCode?.guid || "NO_ACCESS_CODE_FOUND",
      "deny"
    )}">Deny</a>`
  );
}

export function insertEditLink({
  text,
  context: {
    accessCode,
    workflow: { webstore },
  },
}: Params) {
  return text.replace(
    /\{edit\}/gi,
    `<a href="${createApprovalFrontEndUrl(
      webstore.url,
      accessCode?.guid || "NO_ACCESS_CODE_FOUND"
    )}">Review Order</a>`
  );
}

export function insertOrderAdminLink({
  text,
  context: {
    order,
    workflow: { webstore },
  },
}: Params) {
  return text.replace(
    /\{order-wc\}/,
    `<a href="${webstore.url}/wp-admin/post.php?post=${order.id}&action=edit">View Order</a>`
  );
}

export function insertStoreName({
  text,
  context: {
    workflow: { webstore },
  },
}: Params) {
  return text.replace(/\{store\}/, webstore.name);
}

export function insertOrderNumber({ text, context: { order } }: Params) {
  return text.replace(/\{order-id\}/, `${order.number}`);
}

export function insertDenyReason({ text, context: { instance } }: Params) {
  return text.replace(
    /\{deny-reason\}/,
    `${instance.deniedReason || "(no denial reason)"}`
  );
}

export function insertPin({ text, context: { accessCode } }: Params) {
  return text.replace(/\{pin\}/, accessCode?.simplePin || "PIN_NOT_FOUND");
}

export function insertDeniedUser({
  text,
  context: {
    instance: { deniedByUser },
  },
}: Params) {
  return text.replace(/\{deny-user\}/, deniedByUser?.name || "USER_NOT_FOUND");
}

export function insertApprovedUser({
  text,
  context: {
    instance: { approvedByUser },
  },
}: Params) {
  return text.replace(
    /\{approve-user\}/,
    approvedByUser?.name || "USER_NOT_FOUND"
  );
}

export function insertApproveMessage({
  text,
  context: {
    instance: { approvedComments },
  },
}: Params) {
  return text.replace(/\{approve-msg\}/, approvedComments || "(no comments)");
}

function getCheckoutFieldValue(fieldName: string, order: WooCommerceOrder) {
  if (["order_comments", "customer_note"].includes(fieldName))
    return order.customerNote;

  const matchingMetaData = order.metaData.find(
    (meta) => meta.key === fieldName
  );
  return matchingMetaData?.value;
}
