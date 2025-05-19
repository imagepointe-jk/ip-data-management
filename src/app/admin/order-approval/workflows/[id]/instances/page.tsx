import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { ResultsTable } from "./ResultsTable";
import Link from "next/link";
import { ManualInstanceTrigger } from "./ManualInstanceTrigger";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;

  const { id } = params;

  const workflow = await getWorkflowWithIncludes(+id);
  if (!workflow) return <h1>Workflow {id} not found.</h1>;

  return (
    <>
      <h1>Instances of {workflow.name}</h1>
      <Link href={`../${workflow.id}`}>{`< Back to ${workflow.name}`}</Link>
      <ResultsTable workflow={workflow} />
      <div
        className="content-frame"
        style={{ width: "400px", marginTop: "20px" }}
      >
        <ManualInstanceTrigger webstore={workflow.webstore} />
      </div>
    </>
  );
}
