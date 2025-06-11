import {
  createAccessCode,
  createWorkflowInstance,
  getFirstWorkflowForWebstore,
  getWebstoreWithIncludesByUrl,
  getWorkflowInstance,
  getWorkflowWithIncludes,
  setWorkflowInstanceApprovedData,
  setWorkflowInstanceCurrentStep,
  setWorkflowInstanceDeniedData,
  setWorkflowInstanceStatus,
  updateWorkflowInstanceLastStartedDate,
} from "@/db/access/orderApproval";
import { env } from "@/env";
import { sendEmail } from "@/utility/mail";
import { decryptWebstoreData } from "./encryption";
import { getOrder, setOrderStatus } from "@/fetch/woocommerce";
import { handleCurrentStep } from "./main";
import { deduplicateArray } from "@/utility/misc";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { createLog } from "@/actions/orderWorkflow/create";
import {
  OrderWorkflow,
  OrderWorkflowInstance,
  OrderWorkflowUser,
  Webstore,
  WebstoreUserRole,
} from "@prisma/client";

//#region Main
type StartWorkflowParams = {
  webhookSource: string;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
};
export async function startOrderWorkflow(params: StartWorkflowParams) {
  try {
    const { workflowInstance } = await setupOrderWorkflow(params);
    startWorkflowInstanceFromBeginning(workflowInstance.id);
  } catch (error) {
    sendEmail(
      env.DEVELOPER_EMAIL,
      "Error starting workflow",
      `An error occurred while trying to start a workflow instance for WooCommerce order ${params.orderId}. This was the error: ${error}`
    );
    console.error(
      `An error occurred while trying to start a workflow instance for WooCommerce order ${params.orderId}.`
    );
    if (error instanceof Error) throw error;
    else throw new Error("Unknown error while starting the workflow instance.");
  }
}

export async function startWorkflowInstanceFromBeginning(id: number) {
  const instance = await getWorkflowInstance(id);
  if (!instance) throw new Error(`Workflow instance ${id} not found.`);
  const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
  if (!workflow)
    throw new Error(`Workflow ${instance.parentWorkflowId} not found.`);

  //find the first step
  const sortedSteps = [...workflow.steps];
  sortedSteps.sort((a, b) => a.order - b.order);
  const lowestStep = sortedSteps[0];
  const lowestStepOrder = lowestStep ? lowestStep.order : 0;

  //update data
  await setWorkflowInstanceCurrentStep(instance.id, lowestStepOrder);
  await setWorkflowInstanceStatus(instance.id, "waiting");
  await setWorkflowInstanceDeniedData(instance.id, null, null);
  await setWorkflowInstanceApprovedData(instance.id, null, null);
  await updateWorkflowInstanceLastStartedDate(instance.id);
  await setOrderOnHold(workflow, instance);

  await createLog(
    workflow.webstore.id,
    `Workflow instance ${id} started`,
    "info",
    "start workflow instance"
  );

  //execute the first step
  handleCurrentStep(instance);
}

async function setupOrderWorkflow(params: StartWorkflowParams) {
  const { orderId, webhookSource } = params;

  const webstore = await getWebstoreWithIncludesByUrl(webhookSource);
  if (!webstore)
    throw new Error(`No webstore was found with url ${webhookSource}`);

  const { purchaserEmail, purchaserName } = await resolvePurchaserData(
    webstore,
    orderId
  );

  //assume for now that a webstore will only have one workflow for all orders
  const workflowInstance = await createInstanceOfFirstWorkflow(
    webstore,
    purchaserEmail,
    purchaserName,
    orderId
  );

  //create an access code for each user (although not all will need one)
  const deduplicatedUsers = getDeduplicatedUsers(webstore.roles, webstore);
  for (const user of deduplicatedUsers) {
    await createAccessCode(workflowInstance.id, user.id, "approver");
  }

  return {
    workflowInstance,
  };
}
//#endregion
//#region Helpers
async function createInstanceOfFirstWorkflow(
  webstore: Webstore,
  purchaserEmail: string,
  purchaserName: string,
  orderId: number
) {
  const workflow = await getFirstWorkflowForWebstore(webstore.id);
  if (!workflow)
    throw new Error(`No workflow found for webstore ${webstore.name}`);

  const workflowInstance = await createWorkflowInstance(
    workflow.id,
    purchaserEmail,
    purchaserName,
    orderId
  );

  return workflowInstance;
}

async function resolvePurchaserData(webstore: Webstore, orderId: number) {
  const { key, secret } = decryptWebstoreData(webstore);
  const orderResponse = await getOrder(orderId, webstore.url, key, secret);
  if (!orderResponse.ok)
    throw new Error(
      `Received a ${orderResponse.status} response code while retrieving the order`
    );
  const json = await orderResponse.json();
  const parsed = parseWooCommerceOrderJson(json);

  const purchaserEmail =
    parsed.metaData.find((meta) => meta.key === "purchaser_email")?.value ||
    "NO_EMAIL_FOUND";
  const purchaserFirstName = parsed.metaData.find(
    (meta) => meta.key === "purchaser_first_name"
  )?.value;
  const purchaserLastName = parsed.metaData.find(
    (meta) => meta.key === "purchaser_last_name"
  )?.value;
  const purchaserName =
    purchaserFirstName && purchaserLastName
      ? `${purchaserFirstName} ${purchaserLastName}`
      : "NO_NAME_FOUND";

  return { purchaserEmail, purchaserName };
}

function getDeduplicatedUsers(
  roles: (WebstoreUserRole & { users: OrderWorkflowUser[] })[],
  webstore: Webstore
) {
  const deduplicatedUsers = deduplicateArray(
    roles.flatMap((role) => role.users),
    (user) => `${user.id}`
  );
  if (deduplicatedUsers.length === 0)
    throw new Error(`No approver was found for webstore ${webstore.name}`);

  return deduplicatedUsers;
}

async function setOrderOnHold(
  workflow: OrderWorkflow & { webstore: Webstore },
  instance: OrderWorkflowInstance
) {
  try {
    const { key, secret } = decryptWebstoreData(workflow.webstore);
    const response = await setOrderStatus(
      instance.wooCommerceOrderId,
      workflow.webstore.url,
      key,
      secret,
      "on-hold"
    );
    if (!response.ok)
      throw new Error(`The API responded with a ${response.status} status.`);
  } catch (error) {
    sendEmail(
      env.DEVELOPER_EMAIL,
      `Error starting workflow instance ${instance.id}`,
      `Failed to set the corresponding WooCommerce order's status to "ON HOLD". This was the error: ${error}`
    );
    createLog(
      workflow.webstore.id,
      `${error}`,
      "error",
      "start workflow instance"
    );
  }
}
//#endregion
