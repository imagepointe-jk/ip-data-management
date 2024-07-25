import {
  getWorkflowInstanceWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "../encryption";
import { parseWooCommerceOrderJson } from "@/types/validations";
import { WooCommerceOrder } from "@/types/schema";

type Replacer = {
  description: string;
  fn: (text: string, wcOrder: WooCommerceOrder, userName: string) => string;
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
      text.replace(/\{order\}/gi, () => `Order Total $${wcOrder.total}`),
  },
  {
    description: "Insert user's name",
    shortcode: "{user}",
    automatic: false,
    fn: (text, _, userEmail) => text.replace(/\{user\}/gi, () => userEmail),
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
      processed = replacer.fn(processed, parsedOrder, user.name);
    }
    return processed;
  } catch (error) {
    console.error(error);
    return text;
  }
}
