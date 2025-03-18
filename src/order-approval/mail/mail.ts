import {
  getWorkflowInstance,
  getWorkflowInstanceWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "../encryption";
import { createApproverFrontEndUrl, rootUrl } from "@/utility/url";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { Webstore } from "@prisma/client";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

type Replacer = {
  description: string;
  fn: (inputs: {
    text: string;
    wcOrder: WooCommerceOrder;
    userName: string;
    accessCode: string;
    pin: string;
    webstore: Webstore;
    denyReason: string | null;
  }) => string;
  automatic: boolean; //if false, the admin user has to explicitly include the shortcode for the replacer to be used.
  shortcode?: string;
};
export const replacers: Replacer[] = [
  {
    description: "Insert <br> for HTML",
    fn: ({ text }) => text.replace(/\r|\r\n|\n/g, "<br>"),
    automatic: true,
  },
  {
    description: "Insert order details",
    shortcode: "{order}",
    automatic: false,
    fn: ({ text, wcOrder }) =>
      text.replace(/\{order\}/gi, () => {
        const templateSource = fs.readFileSync(
          path.resolve(
            process.cwd(),
            "src/order-approval/mail/orderDetails.hbs"
          ),
          "utf-8"
        );
        const template = handlebars.compile(templateSource);
        const message = template(wcOrder);
        return message;
      }),
  },
  {
    description: "Insert user's name",
    shortcode: "{user}",
    automatic: false,
    fn: ({ text, userName }) => text.replace(/\{user\}/gi, () => userName),
  },
  {
    description: "Approver's 'approve' link",
    shortcode: "{approve}",
    automatic: false,
    fn: ({ text, accessCode, webstore }) =>
      text.replace(
        /\{approve\}/gi,
        `<a href="${createApproverFrontEndUrl(
          webstore.url,
          accessCode,
          "approve"
        )}">Approve</a>`
      ),
  },
  {
    description: "Approver's 'deny' link",
    shortcode: "{deny}",
    automatic: false,
    fn: ({ text, accessCode, webstore }) =>
      text.replace(
        /\{deny\}/gi,
        `<a href="${createApproverFrontEndUrl(
          webstore.url,
          accessCode,
          "deny"
        )}">Deny</a>`
      ),
  },
  {
    description: "Approver's link to review/edit order",
    shortcode: "{edit}",
    automatic: false,
    fn: ({ text, accessCode, webstore }) =>
      text.replace(
        /\{edit\}/gi,
        `<a href="${createApproverFrontEndUrl(
          webstore.url,
          accessCode
        )}">Review Order</a>`
      ),
  },
  {
    description: "Link to order details in WooCommerce backend",
    shortcode: "{order-wc}",
    automatic: false,
    fn: ({ text, wcOrder, webstore }) =>
      text.replace(
        /\{order-wc\}/,
        `<a href="${webstore.url}/wp-admin/post.php?post=${wcOrder.id}&action=edit">View Order</a>`
      ),
  },
  {
    description: "Store name",
    shortcode: "{store}",
    automatic: false,
    fn: ({ text, webstore }) => text.replace(/\{store\}/, webstore.name),
  },
  {
    description: "Order ID",
    shortcode: "{order-id}",
    automatic: false,
    fn: ({ text, wcOrder }) => text.replace(/\{order-id\}/, `${wcOrder.id}`),
  },
  {
    description: "Reason given for order denial",
    shortcode: "{deny-reason}",
    automatic: false,
    fn: ({ text, denyReason }) =>
      text.replace(/\{deny-reason\}/, `${denyReason || "(no denial reason)"}`),
  },
  {
    description: "The user's PIN, unique to the current workflow instance",
    shortcode: "{pin}",
    automatic: false,
    fn: ({ text, pin }) => text.replace(/\{pin\}/, pin),
  },
];

export async function processFormattedText(
  text: string,
  instanceId: number,
  userEmail: string
) {
  try {
    const instance = await getWorkflowInstanceWithIncludes(instanceId);
    if (!instance) throw new Error(`Instance ${instanceId} not found.`);

    const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
    if (!workflow)
      throw new Error(`Workflow ${instance.parentWorkflowId} not found.`);
    const user = workflow.webstore.userRoles.find(
      (role) => role.user.email === userEmail
    )?.user;
    if (!user) console.error(`User with email ${userEmail} not found.`);
    const accessCode = instance.accessCodes.find(
      (code) => code.user.email === userEmail
    );
    if (!accessCode)
      console.error(
        `Access code not found for user ${userEmail} on workflow instance ${instance.id}.`
      );

    const { key, secret } = decryptWebstoreData(workflow.webstore);
    const orderResponse = await getOrder(
      instance?.wooCommerceOrderId,
      workflow.webstore.url,
      key,
      secret
    );
    if (!orderResponse.ok)
      throw new Error(`Failed to get WooCommerce order ${workflow.id}`);
    const orderJson = await orderResponse.json();
    const parsedOrder = parseWooCommerceOrderJson(orderJson);

    let processed = text;
    for (const replacer of replacers) {
      processed = replacer.fn({
        text: processed,
        wcOrder: parsedOrder,
        accessCode: accessCode?.guid || "ACCESS_CODE_NOT_FOUND",
        userName: user?.name || "USER_NOT_FOUND",
        webstore: workflow.webstore,
        denyReason: instance.deniedReason,
        pin: accessCode?.simplePin || "NO_PIN_FOUND",
      });
    }
    return processed;
  } catch (error) {
    console.error(error);
    return text;
  }
}

//this email is specifically intended for notifying the shipping dept. upon order approval
export async function createShippingEmail(instanceId: number) {
  try {
    const instance = await getWorkflowInstance(instanceId);
    if (!instance)
      throw new Error(`Workflow instance ${instanceId} not found.`);

    const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
    if (!workflow)
      throw new Error(`Parent workflow of instance ${instanceId} not found.`);

    const { key, secret } = decryptWebstoreData(workflow.webstore);
    const orderResponse = await getOrder(
      instance.wooCommerceOrderId,
      workflow.webstore.url,
      key,
      secret
    );
    if (!orderResponse.ok)
      throw new Error(
        `Failed to fetch WooCommerce order for workflow instance ${instanceId} with status ${orderResponse.status}`
      );
    const orderJson = await orderResponse.json();
    const parsed = parseWooCommerceOrderJson(orderJson);

    const templateSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/order-approval/mail/shippingEmail.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    const message = template({
      ...parsed,
      storeUrl: workflow.webstore.url,
      storeName: workflow.webstore.name,
    });
    return message;
  } catch (error) {
    console.error("Error creating shipping email", error);
    return "EMAIL ERROR";
  }
}

export async function createSupportEmail(
  webstore: Webstore,
  orderId: number,
  fullUserName: string,
  userEmail: string,
  comments: string
) {
  try {
    const { key, secret } = decryptWebstoreData(webstore);
    const orderResponse = await getOrder(orderId, webstore.url, key, secret);
    if (!orderResponse.ok)
      throw new Error(
        `Failed to fetch WooCommerce order ${orderId} with status ${orderResponse.status}`
      );
    const orderJson = await orderResponse.json();
    const parsed = parseWooCommerceOrderJson(orderJson);

    const templateSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/order-approval/mail/supportEmail.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    const message = template({
      ...parsed,
      userName: fullUserName,
      userEmail,
      storeUrl: webstore.url,
      storeName: webstore.name,
      comments,
    });
    return message;
  } catch (error) {
    console.error("Error creating support email", error);
    return "EMAIL ERROR";
  }
}

export async function createOrderUpdatedEmail(
  order: WooCommerceOrder,
  storeName: string
) {
  try {
    const templateSource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/order-approval/mail/orderUpdatedEmail.hbs"
      ),
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    const message = template({
      ...order,
      storeName,
      shippingMethod: order.shippingLines[0]?.method_title,
    });
    return message;
  } catch (error) {
    console.error("Error creating support email", error);
    return "EMAIL ERROR";
  }
}
