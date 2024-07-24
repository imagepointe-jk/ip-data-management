import { getWorkflowInstanceWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";

type Props = {
  params: {
    id: string;
    instanceId: string;
  };
};
export default async function Page({ params: { id, instanceId } }: Props) {
  const instance = await getWorkflowInstanceWithIncludes(+instanceId);
  if (!instance) return <h1>Instance {instanceId} not found.</h1>;

  return (
    <>
      <h1>
        Instance {instance.id} of Workflow {id}
      </h1>
      <ul>
        <li>Started on (date)</li>
        <li>WooCommerce Order ID: {instance.wooCommerceOrderId}</li>
        <li>Status: {instance.status}</li>
        <li>Current Step: {instance.currentStep}</li>
      </ul>
      <h2>Users</h2>
      <ResultsTable instance={instance} />
    </>
  );
}
