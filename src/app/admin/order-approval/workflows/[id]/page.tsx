import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { EditingForm } from "./EditingForm";
import { WorkflowPreview } from "./WorkflowPreview";
import { replacers } from "@/order-approval/mail/mail";

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
      <EditingForm workflow={workflow} />
      <div className="content-frame" style={{ width: "600px" }}>
        <details>
          <summary>Shortcode Reference</summary>
          <ul>
            {replacers
              .filter((replacer) => !replacer.automatic)
              .map((replacer, i) => (
                <li key={i}>
                  <strong>{replacer.shortcode}</strong> - {replacer.description}
                </li>
              ))}
          </ul>
        </details>
      </div>
      <WorkflowPreview steps={workflow.steps} />
    </>
  );
}
