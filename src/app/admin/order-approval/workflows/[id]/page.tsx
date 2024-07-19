import { getWorkflowWithIncludes } from "@/db/access/orderApproval";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params: { id } }: Props) {
  const workflow = await getWorkflowWithIncludes(+id);
  if (!workflow) return <h1>Workflow {id} not found.</h1>;

  return (
    <>
      <h1>Edit Workflow</h1>
      <h2>
        Name:{" "}
        <input type="text" name="name" id="name" defaultValue={workflow.name} />
      </h2>
      <ul>
        {workflow.steps.map((step) => (
          <li key={step.id}>{step.name}</li>
        ))}
      </ul>
    </>
  );
}
