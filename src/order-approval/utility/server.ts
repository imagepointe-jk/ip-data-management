import {
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
  Webstore,
} from "@prisma/client";
import { decryptWebstoreData } from "../encryption";
import { getOrder, OrderUpdateData } from "@/fetch/woocommerce";
import { prisma } from "../../../prisma/client";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import {
  OrderWorkflowEventType,
  WebstoreLogEvent,
  WebstoreLogSeverity,
} from "@/types/schema/orderApproval";
import { createLog } from "@/actions/orderWorkflow/create";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

//dynamic values like "purchaser" and "approver" can be used for action targets, event listener "from" values, etc.
export async function resolveDynamicUserIdentifier(
  target: string | null,
  workflowInstance: OrderWorkflowInstance
) {
  if (target === "purchaser") return workflowInstance.purchaserEmail;
  if (target !== "approver") return target;

  //the target is "approver", so we will need to fetch the order from WC and get the email listed in the order metadata
  const workflow = await prisma.orderWorkflow.findUnique({
    where: {
      id: workflowInstance.parentWorkflowId,
    },
    include: {
      webstore: true,
    },
  });
  if (!workflow)
    throw new Error(
      `Webstore associated with workflow instance ${workflowInstance.id} not found`
    );
  const { key, secret } = decryptWebstoreData(workflow.webstore);
  const orderResponse = await getOrder(
    workflowInstance.wooCommerceOrderId,
    workflow.webstore.url,
    key,
    secret
  );
  if (!orderResponse.ok)
    throw new Error(
      `Received response status ${orderResponse.status} while trying to resolve action target for workflow instance ${workflowInstance.id}`
    );
  const json = await orderResponse.json();
  const parsed = parseWooCommerceOrderJson(json);
  const approverEmail = parsed.metaData.find(
    (meta) => meta.key === "approver"
  )?.value;
  return approverEmail;
}

//each listener could potentially have a dynamnic "from" value such as "approver", so look at each listener, resolve its "from" value as needed, and check if it matches the source and event type
export async function matchProceedListenerToEvent(
  step: OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  },
  workflowInstance: OrderWorkflowInstance,
  source: string,
  type: OrderWorkflowEventType
) {
  for (const listener of step.proceedListeners) {
    if (listener.type !== type) continue;
    const resolvedFrom = await resolveDynamicUserIdentifier(
      listener.from,
      workflowInstance
    );
    if (resolvedFrom?.toLocaleLowerCase() === source.toLocaleLowerCase())
      return listener;
  }
  return undefined;
}

//wrapper for more easily creating webstore log in the context of a workflow instance action.
//helps keep things cleaner by not requiring the rest of the logic to be interrupted by retrieving the webstore id every time.
export async function createWorkflowInstanceLog(
  workflowInstanceId: number,
  text: string,
  severity: WebstoreLogSeverity,
  event: WebstoreLogEvent
) {
  const workflowInstance = await prisma.orderWorkflowInstance.findUnique({
    where: {
      id: workflowInstanceId,
    },
    include: {
      parentWorkflow: {
        include: {
          webstore: true,
        },
      },
    },
  });

  const webstoreId = workflowInstance?.parentWorkflow.webstoreId || -1; //if instance is not found, -1 will cause an error in createLog that will be caught there
  return createLog(webstoreId, text, severity, event);
}

export async function getParsedWebstoreOrder(
  webstore: Webstore,
  orderId: number
) {
  const { key, secret } = decryptWebstoreData(webstore);
  const orderResponse = await getOrder(orderId, webstore.url, key, secret);
  if (!orderResponse.ok)
    throw new Error(
      `Received a ${orderResponse.status} response code while retrieving the order`
    );
  const json = await orderResponse.json();
  return parseWooCommerceOrderJson(json);
}

export function createUpdateData(
  order: WooCommerceOrder,
  removeLineItemIds: number[]
): OrderUpdateData {
  //woocommerce API requires us to set quantity to 0 for any line items we want to delete
  //set quantity 0 as needed, but leave the rest of the line items unchanged
  const lineItemsWithDeletions = order.lineItems.map((lineItem) => ({
    ...lineItem,
    quantity: removeLineItemIds.includes(lineItem.id) ? 0 : lineItem.quantity,
  }));

  return {
    id: order.id,
    customer_note: order.customerNote,
    line_items: lineItemsWithDeletions,
    meta_data: order.metaData,
    shipping: {
      ...order.shipping,
      first_name: order.shipping.firstName,
      last_name: order.shipping.lastName,
      address_1: order.shipping.address1,
      address_2: order.shipping.address2,
    },
    shipping_lines: order.shippingLines,
  };
}
