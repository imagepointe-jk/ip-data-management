"use client";

import { createStep } from "@/actions/orderWorkflow/create";
import { updateWorkflow } from "@/actions/orderWorkflow/update";
import { useToast } from "@/components/ToastProvider";
import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { UnwrapPromise } from "@/types/schema/misc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Step } from "./Step";

type Props = {
  workflow: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
};
export function EditingForm({ workflow }: Props) {
  const router = useRouter();
  const toast = useToast();
  const sorted = [...workflow.steps];
  sorted.sort((a, b) => a.order - b.order);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  async function onClickAddStep() {
    const currentLastStep = sorted[sorted.length - 1];
    const orderToUse = currentLastStep ? currentLastStep.order + 1 : 0;

    await createStep(workflow.id, orderToUse);
    router.refresh();
  }

  async function onSubmit(e: FormData) {
    await updateWorkflow(e);
    toast.changesSaved();
    router.refresh();
  }

  return (
    <form action={(e) => onSubmit(e)} className="vert-flex-group">
      {workflow.instances.length > 0 && (
        <Link href={`${workflow.id}/instances`}>
          View {workflow.instances.length} instance(s)
        </Link>
      )}
      <h2>
        Name:{" "}
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={workflow.name}
          className="input-major"
        />
      </h2>
      <div className="vert-flex-group">
        {sorted.map((step) => (
          <Step
            key={step.id}
            step={step}
            workflowUsers={workflow.webstore.userRoles.map((role) => ({
              ...role.user,
              role: role.role === "approver" ? "approver" : "purchaser",
            }))}
            canBeMovedDown={step.id !== last?.id}
            canBeMovedUp={step.id !== first?.id}
          />
        ))}
      </div>
      {<input type="hidden" name="existingWorkflowId" value={workflow.id} />}
      <div>
        <button type="button" onClick={onClickAddStep}>
          + Add Step
        </button>
      </div>
      <button type="submit" className={styles["save-changes-button"]}>
        Save Changes
      </button>
    </form>
  );
}
