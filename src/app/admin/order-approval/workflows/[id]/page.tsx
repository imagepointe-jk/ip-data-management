import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { EditingForm } from "./EditingForm";
import { WorkflowPreview } from "./WorkflowPreview";
import { ShortcodeReference } from "../../ShortcodeReference";

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
      <h1>Editing Workflow</h1>
      <div className="vert-flex-group">
        <EditingForm workflow={workflow} />
        <ShortcodeReference />
      </div>
      <WorkflowPreview steps={workflow.steps} />
    </>
  );
}
