import {
  getWorkflowInstanceWithIncludes,
  getWorkflowStepByNumber,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";
import Link from "next/link";

type Props = {
  params: {
    id: string;
    instanceId: string;
  };
};
export default async function Page({ params: { id, instanceId } }: Props) {
  const instance = await getWorkflowInstanceWithIncludes(+instanceId);
  if (!instance) return <h1>Instance {instanceId} not found.</h1>;
  const workflow = await getWorkflowWithIncludes(instance.parentWorkflowId);
  if (!workflow) return <h1>Workflow for instance {instanceId} not found.</h1>;

  const step = await getWorkflowStepByNumber(
    instance.parentWorkflowId,
    instance.currentStep
  );

  return (
    <>
      <h1>
        Instance {instance.id} of Workflow {id}
      </h1>
      <Link href="../instances">&lt; Back to instances</Link>
      <ul>
        <li>Started on: {instance.createdAt.toLocaleString()}</li>
        <li>WooCommerce Order ID: {instance.wooCommerceOrderId}</li>
        <li>Status: {instance.status}</li>
        <li>
          Current Step: {instance.currentStep} (
          {step ? step.name : "Step not found"}){" "}
        </li>
      </ul>
      {instance.status === "finished" && (
        <div className="content-frame" style={{ width: "400px" }}>
          {instance.deniedReason && (
            <>
              This order has been <strong>DENIED</strong> for the following
              reason: <p>{instance.deniedReason}</p>
            </>
          )}
          {!instance.deniedReason && (
            <>
              This order has been <strong>APPROVED</strong>.
            </>
          )}
        </div>
      )}
      <h2>Users</h2>
      <ResultsTable instance={instance} webstoreUrl={workflow.webstore.url} />
    </>
  );
}