import { prisma } from "../../../../prisma/client";
import { TempDeleteWorkflowButton } from "./TempDeleteWorkflowButton";

export default async function OrderApproval() {
  const instances = await prisma.orderWorkflowInstance.findMany();

  return (
    <>
      <h1>Order Approval Data</h1>
      <ul>
        {instances.map((instance) => (
          <li key={instance.id}>
            Instance {instance.id} <TempDeleteWorkflowButton id={instance.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
