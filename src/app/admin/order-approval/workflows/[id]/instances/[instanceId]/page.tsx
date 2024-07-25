import {
  getWorkflowInstanceWithIncludes,
  getWorkflowStepByNumber,
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
      <h2>Users</h2>
      <ResultsTable instance={instance} />
    </>
  );
}
