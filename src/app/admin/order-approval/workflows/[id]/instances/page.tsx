import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";
import Link from "next/link";

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
      <h1>Instances of {workflow.name}</h1>
      <Link href={`../${workflow.id}`}>{`< Back to ${workflow.name}`}</Link>
      <ResultsTable workflow={workflow} />
    </>
  );
}
