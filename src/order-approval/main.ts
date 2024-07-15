import {
  createAccessCode,
  createUser,
  createWorkflowInstance,
  getFirstWorkflowForWebstore,
  getWebstore,
  getUser,
} from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { parseWooCommerceOrderJson } from "@/types/validations";
import { decrypt } from "@/utility/misc";
import { OrderWorkflowUser, Webstore } from "@prisma/client";

type StartWorkflowParams = {
  webhookSource: string;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
};
export async function startOrderWorkflow(params: StartWorkflowParams) {
  const {
    approver,
    approverAccessCode,
    webstore,
    purchaser,
    purchaserAccessCode,
    workflowInstance,
  } = await setupOrderWorkflow(params);

  console.log(
    `Finished setup on workflow instance ${workflowInstance.id} for webstore ${webstore.id}.`
  );

  await sendInitialEmails(purchaser, approver, params.orderId, webstore);
}

async function setupOrderWorkflow(params: StartWorkflowParams) {
  const { email, firstName, lastName, orderId, webhookSource } = params;
  console.log("=====================started workflow");
  const webstore = await getWebstore(webhookSource);
  if (!webstore)
    throw new Error(`No webstore was found with url ${webhookSource}`);

  const purchaser =
    (await getUser(webstore.id, email)) ||
    (await createUser(email, `${firstName} ${lastName}`, webstore.id));

  //! approver will need to no longer be hard-coded if we decide to use this with different organizations
  //! This has not been implemented now because of too many uncertainties (will webstores have multiple approvers, etc.)
  const approver = await getUser(webstore.id, "approver-email@example.com");
  if (!approver)
    throw new Error(`No approver was found for webstore ${webstore.name}`);

  //! assume for now that a webstore will only have one workflow for all orders
  const workflow = await getFirstWorkflowForWebstore(webstore.id);
  if (!workflow)
    throw new Error(`No workflow found for webstore ${webstore.name}`);

  const workflowInstance = await createWorkflowInstance(workflow.id, orderId);
  const purchaserAccessCode = await createAccessCode(
    workflowInstance.id,
    purchaser.id,
    "purchaser"
  );
  const approverAccessCode = await createAccessCode(
    workflowInstance.id,
    approver.id,
    "approver"
  );

  return {
    webstore,
    purchaser,
    approver,
    workflowInstance,
    purchaserAccessCode,
    approverAccessCode,
  };
}

async function sendInitialEmails(
  purchaser: OrderWorkflowUser,
  approver: OrderWorkflowUser,
  wooCommerceOrderId: number,
  webstore: Webstore
) {
  const decryptedKey = decrypt(
    webstore.apiKey,
    webstore.apiKeyEncryptIv,
    webstore.apiKeyEncryptTag
  );
  const decryptedSecret = decrypt(
    webstore.apiSecret,
    webstore.apiSecretEncryptIv,
    webstore.apiSecretEncryptTag
  );
  const orderResponse = await getOrder(
    wooCommerceOrderId,
    webstore.url,
    decryptedKey,
    decryptedSecret
  );
  if (!orderResponse.ok) {
    throw new Error(
      `There was a problem retrieving WooCommerce order ${wooCommerceOrderId}`
    );
  }
  const orderJson = await orderResponse.json();
  const orderParsed = parseWooCommerceOrderJson(orderJson);
  console.log(orderParsed.lineItems.length);
}
