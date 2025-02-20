"use client";
import { duplicateWorkflow } from "@/actions/orderWorkflow/create";
import { useToast } from "@/components/ToastProvider";
// import { getWorkflowsWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/schema/misc";
import { Webstore } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  // workflows: UnwrapPromise<ReturnType<typeof getWorkflowsWithIncludes>>;
  workflows: {
    id: number;
    name: string;
  }[];
  webstores: {
    data: Webstore;
    hasWorkflow: boolean;
  }[];
};
export function DuplicateWorkflow({ workflows, webstores }: Props) {
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id);
  const [webstoreId, setWebstoreId] = useState(webstores[0]?.data.id);
  const [status, setStatus] = useState(
    "idle" as "idle" | "loading" | "error" | "success"
  );
  const router = useRouter();
  const toast = useToast();
  const selectedWebstoreHasWorkflow =
    webstores.find((webstore) => webstore.data.id === webstoreId)
      ?.hasWorkflow || false;

  async function duplicate() {
    if (
      !workflowId ||
      !webstoreId ||
      selectedWebstoreHasWorkflow ||
      status === "loading"
    )
      return;

    setStatus("loading");
    try {
      await duplicateWorkflow(workflowId, webstoreId);
      setStatus("success");
      toast.changesSaved();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
    router.refresh();
  }

  return (
    <>
      <div className="input-group-heading">Duplicate Workflow</div>
      <div className="vert-flex-group">
        <p>
          This will duplicate a workflow with all of its steps and assign it to
          the selected webstore. Users and instances will NOT carry over.
        </p>
        <div>
          <label className="input-label">Workflow to Duplicate</label>
          <select
            name="workflow-select"
            onChange={(e) => setWorkflowId(+e.target.value)}
          >
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Target Webstore</label>
          <select
            name="webstore-select"
            onChange={(e) => setWebstoreId(+e.target.value)}
          >
            {webstores.map((webstore) => (
              <option key={webstore.data.id} value={webstore.data.id}>
                {webstore.data.name}
              </option>
            ))}
          </select>
        </div>
        {selectedWebstoreHasWorkflow && (
          <div style={{ color: "red" }}>
            This webstore already has a workflow.
          </div>
        )}
        <div>
          <button
            disabled={selectedWebstoreHasWorkflow || status === "loading"}
            onClick={duplicate}
          >
            + Duplicate
          </button>
        </div>
        <div>
          {status === "loading" && <>Duplicating workflow...</>}
          {status === "error" && (
            <span style={{ color: "red" }}>Error duplicating workflow.</span>
          )}
        </div>
      </div>
    </>
  );
}
