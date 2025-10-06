import { WooCommerceOrder } from "@/types/schema/woocommerce";
import { OrderWorkflowEmailContext } from "@/types/schema/orderApproval";
import {
  insertApprovedUser,
  insertApproveLink,
  insertApproveMessage,
  insertBreak,
  insertDeniedUser,
  insertDenyLink,
  insertDenyReason,
  insertEditLink,
  insertOrderAdminLink,
  insertOrderDetails,
  insertOrderNumber,
  insertPin,
  insertStoreName,
  insertUserName,
} from "./replacers";
import { getParsedWebstoreOrder } from "../utility";
import { runHandlebarsTemplate } from "@/utility/mail";
import {
  getWorkflowInstanceWithIncludes,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";

type Replacer = {
  description: string;
  fn: (inputs: { text: string; context: OrderWorkflowEmailContext }) => string;
  automatic: boolean; //if false, the admin user has to explicitly include the shortcode for the replacer to be used. otherwise, it will be used no matter what.
  shortcode?: string;
};
export const replacers: Replacer[] = [
  {
    description: "Insert <br> for HTML",
    fn: insertBreak,
    automatic: true,
  },
  {
    description: "Insert order details",
    shortcode: "{order}",
    automatic: false,
    fn: insertOrderDetails,
  },
  {
    description: "Insert user's name",
    shortcode: "{user}",
    automatic: false,
    fn: insertUserName,
  },
  {
    description: "Approver's 'approve' link",
    shortcode: "{approve}",
    automatic: false,
    fn: insertApproveLink,
  },
  {
    description: "Approver's 'deny' link",
    shortcode: "{deny}",
    automatic: false,
    fn: insertDenyLink,
  },
  {
    description: "Approver's link to review/edit order",
    shortcode: "{edit}",
    automatic: false,
    fn: insertEditLink,
  },
  {
    description: "Link to order details in WooCommerce backend",
    shortcode: "{order-wc}",
    automatic: false,
    fn: insertOrderAdminLink,
  },
  {
    description: "Store name",
    shortcode: "{store}",
    automatic: false,
    fn: insertStoreName,
  },
  {
    // we basically never need the database id to display in text form, so just treat it as the order number for this purpose
    description: "Order Number (not the order's database ID)",
    shortcode: "{order-id}",
    automatic: false,
    fn: insertOrderNumber,
  },
  {
    description: "Reason given for order denial",
    shortcode: "{deny-reason}",
    automatic: false,
    fn: insertDenyReason,
  },
  {
    description: "The user's PIN, unique to the current workflow instance",
    shortcode: "{pin}",
    automatic: false,
    fn: insertPin,
  },
  {
    description: "The user that denied the order, if any",
    shortcode: "{deny-user}",
    automatic: false,
    fn: insertDeniedUser,
  },
  {
    description: "The user that most recently approved the order, if any",
    shortcode: "{approve-user}",
    automatic: false,
    fn: insertApprovedUser,
  },
  {
    description: "The comments given with the approval, if any",
    shortcode: "{approve-msg}",
    automatic: false,
    fn: insertApproveMessage,
  },
];

export async function processFormattedText(
  text: string,
  context: OrderWorkflowEmailContext
) {
  try {
    let processed = text;
    for (const replacer of replacers) {
      processed = replacer.fn({
        text: processed,
        context,
      });
    }
    return processed;
  } catch (error) {
    console.error(error);
    return text;
  }
}

//this email is specifically intended for notifying the shipping dept. upon order approval
export async function createShippingEmail(
  instanceId: number
): Promise<{ body: string; subject: string }> {
  try {
    const { workflow, order, instance } = await createEmailContext(
      instanceId,
      ""
    );

    const message = runHandlebarsTemplate(
      `src/order-approval/mail/shippingEmails/${workflow.webstore.shippingEmailFilename}.hbs`,
      {
        ...order,
        storeUrl: workflow.webstore.url,
        storeName: workflow.webstore.name,
        approveMsg: instance.approvedComments,
        shippingMethod: order.shippingLines[0]?.method_title,
      }
    );

    return {
      body: message,
      subject: `Order ${order.number} Approved`,
    };
  } catch (error) {
    console.error("Error creating shipping email", error);
    return {
      body: "EMAIL ERROR",
      subject: "EMAIL ERROR",
    };
  }
}

export function createSupportEmail(
  context: OrderWorkflowEmailContext,
  comments: string
): { body: string; subject: string } {
  const {
    order,
    targetPrimary: userEmail,
    userName,
    workflow: { webstore },
  } = context;

  try {
    const message = runHandlebarsTemplate(
      "src/order-approval/mail/supportEmail.hbs",
      {
        ...order,
        userName,
        userEmail,
        storeUrl: webstore.url,
        storeName: webstore.name,
        comments,
      }
    );
    return {
      body: message,
      subject: `Support request for order ${order.number}`,
    };
  } catch (error) {
    console.error("Error creating support email", error);
    return {
      body: "EMAIL ERROR",
      subject: "EMAIL ERROR",
    };
  }
}

export async function createOrderUpdatedEmail(
  order: WooCommerceOrder,
  storeName: string
) {
  try {
    const message = runHandlebarsTemplate(
      "src/order-approval/mail/orderUpdatedEmail.hbs",
      {
        ...order,
        storeName,
        shippingMethod: order.shippingLines[0]?.method_title,
      }
    );
    return message;
  } catch (error) {
    console.error("Error creating support email", error);
    return "EMAIL ERROR";
  }
}

export async function createEmailContext(
  instanceId: number,
  targetPrimary: string
): Promise<OrderWorkflowEmailContext> {
  const instance = await getWorkflowInstanceWithIncludes(instanceId);
  if (!instance) throw new Error(`Instance ${instanceId} not found.`);

  const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
  if (!workflow)
    throw new Error(`Workflow ${instance.parentWorkflowId} not found.`);

  const firstRoleWithGivenEmail = workflow.webstore.roles.find(
    (role) =>
      !!role.users.find(
        (user) =>
          user.email.toLocaleLowerCase() === targetPrimary.toLocaleLowerCase()
      )
  );
  const userWithEmail = firstRoleWithGivenEmail?.users.find(
    (user) =>
      user.email.toLocaleLowerCase() === targetPrimary.toLocaleLowerCase()
  );
  const userName =
    targetPrimary.toLocaleLowerCase() ===
    instance.purchaserEmail.toLocaleLowerCase()
      ? instance.purchaserName
      : userWithEmail?.name || "USER_NOT_FOUND";

  const approvedByPin =
    instance.accessCodes.find(
      (code) => code.userId === instance.approvedByUser?.id
    )?.simplePin || "PIN_NOT_FOUND";

  const accessCode = instance.accessCodes.find(
    (code) =>
      code.user.email.toLocaleLowerCase() === targetPrimary.toLocaleLowerCase()
  );
  if (!accessCode)
    console.error(
      `Access code not found for user ${targetPrimary} on workflow instance ${instance.id}.`
    );

  const parsedOrder = await getParsedWebstoreOrder(
    workflow.webstore,
    instance.wooCommerceOrderId
  );

  return {
    order: parsedOrder,
    instance,
    workflow,
    targetPrimary,
    userName,
    accessCode,
    approvedByPin,
  };
}
