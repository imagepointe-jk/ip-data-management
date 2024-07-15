import {
  createAccessCode,
  createUser,
  createWorkflowInstance,
  getFirstWorkflowForOrganization,
  getOrganization,
  getUser,
} from "@/db/access/orderApproval";

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
    organization,
    purchaser,
    purchaserAccessCode,
    workflowInstance,
  } = await setupOrderWorkflow(params);

  console.log(
    `Started workflow instance ${workflowInstance.id} for organization ${organization.id}.`
  );
}

async function setupOrderWorkflow(params: StartWorkflowParams) {
  const { email, firstName, lastName, orderId, webhookSource } = params;
  const organization = await getOrganization(webhookSource);
  if (!organization)
    throw new Error(`No organization was found with url ${webhookSource}`);

  const purchaser =
    (await getUser(organization.id, email)) ||
    (await createUser(email, `${firstName} ${lastName}`, organization.id));

  //! approver will need to no longer be hard-coded if we decide to use this with different organizations
  //! This has not been implemented now because of too many uncertainties (will organizations have multiple approvers, etc.)
  const approver = await getUser(organization.id, "approver-email@example.com");
  if (!approver)
    throw new Error(
      `No approver was found for organization ${organization.name}`
    );

  //! assume for now that an organization will only have one workflow for all orders
  const workflow = await getFirstWorkflowForOrganization(organization.id);
  if (!workflow)
    throw new Error(`No workflow found for organization ${organization.name}`);

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
    organization,
    purchaser,
    approver,
    workflowInstance,
    purchaserAccessCode,
    approverAccessCode,
  };
}
