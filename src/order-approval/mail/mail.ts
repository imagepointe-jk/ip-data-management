import {
  getWorkflowInstanceWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "../encryption";
import { WooCommerceOrder } from "@/types/schema";
import { rootUrl } from "@/utility/url";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { Webstore } from "@prisma/client";

type Replacer = {
  description: string;
  fn: (
    text: string,
    wcOrder: WooCommerceOrder,
    userName: string,
    accessCode: string,
    webstore: Webstore
  ) => string;
  automatic: boolean; //if false, the admin user has to explicitly include the shortcode for the replacer to be used.
  shortcode?: string;
};
const replacers: Replacer[] = [
  {
    description: "Insert <br> for HTML",
    fn: (text: string) => text.replace(/\r\n/g, "<br>"),
    automatic: true,
  },
  {
    description: "Insert order details",
    shortcode: "{order}",
    automatic: false,
    fn: (text, wcOrder) =>
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
    fn: (text, _, userEmail) => text.replace(/\{user\}/gi, () => userEmail),
  },
  {
    description: "Approver's 'approve' link",
    shortcode: "{approve}",
    automatic: false,
    fn: (text, _, __, accessCode) =>
      text.replace(
        /\{approve\}/gi,
        `<a href="${rootUrl()}/order-approval/${accessCode}/approve">Approve</a>`
      ),
  },
  {
    description: "Approver's 'deny' link",
    shortcode: "{deny}",
    automatic: false,
    fn: (text, _, __, accessCode) =>
      text.replace(
        /\{deny\}/gi,
        `<a href="${rootUrl()}/order-approval/${accessCode}/deny">Deny</a>`
      ),
  },
  {
    description: "Approver's link to review/edit order",
    shortcode: "{edit}",
    automatic: false,
    fn: (text, _, __, accessCode) =>
      text.replace(
        /\{edit\}/gi,
        `<a href="${rootUrl()}/order-approval/${accessCode}">Review Order</a>`
      ),
  },
  {
    description: "Link to order details in WooCommerce backend",
    shortcode: "{order-wc}",
    automatic: false,
    fn: (text, wcOrder, _, __, webstore) =>
      text.replace(
        /\{order-wc\}/,
        `<a href="${webstore.url}/wp-admin/post.php?post=${wcOrder.id}&action=edit">View Order</a>`
      ),
  },
  {
    description: "Store name",
    shortcode: "{store}",
    automatic: false,
    fn: (text, _, __, ___, webstore) =>
      text.replace(/\{store\}/, webstore.name),
  },
  {
    description: "Order ID",
    shortcode: "{order-id}",
    automatic: false,
    fn: (text, wcOrder) => text.replace(/\{order-id\}/, `${wcOrder.id}`),
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
    const user = workflow.webstore.users.find(
      (user) => user.email === userEmail
    );
    if (!user) throw new Error(`User with email ${userEmail} not found.`);
    const accessCode = instance.accessCodes.find(
      (code) => code.user.email === userEmail
    );
    if (!accessCode)
      throw new Error(
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
      processed = replacer.fn(
        processed,
        parsedOrder,
        user.name,
        accessCode.guid,
        workflow.webstore
      );
    }
    return processed;
  } catch (error) {
    console.error(error);
    return text;
  }
}
