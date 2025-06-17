import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { EditingForm } from "./EditingForm/EditingForm";
import { WorkflowPreview } from "./WorkflowPreview";
import { ShortcodeReference } from "../../ShortcodeReference";
import { WorkflowEditingContextProvider } from "./WorkflowEditingContext";

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
      <h1>Editing Workflow</h1>
      <WorkflowEditingContextProvider workflow={workflow}>
        <div className="vert-flex-group">
          <EditingForm />
          <ShortcodeReference />
        </div>
        <WorkflowPreview />
      </WorkflowEditingContextProvider>
    </>
  );
}
