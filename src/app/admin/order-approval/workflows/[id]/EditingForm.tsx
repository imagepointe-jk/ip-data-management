"use client";

import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import { OrderWorkflowStep } from "@prisma/client";
import styles from "@/styles/orderApproval/orderApproval.module.css";

type Props = {
  existingWorkflow: UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>;
};
export function EditingForm({ existingWorkflow }: Props) {
  const sorted = existingWorkflow ? [...existingWorkflow.steps] : [];
  sorted.sort((a, b) => a.order - b.order);

  return (
    <>
      <h2>
        Name:{" "}
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={existingWorkflow ? existingWorkflow.name : undefined}
        />
      </h2>
      <div className={styles["steps-container"]}>
        {sorted.map((step) => (
          <Step key={step.id} step={step} />
        ))}
      </div>
    </>
  );
}

type StepProps = {
  step: OrderWorkflowStep;
};
function Step({ step }: StepProps) {
  return (
    <div className={styles["single-step-container"]}>
      <h3>{step.name}</h3>
      <div className={styles["step-subcontainer"]}>
        <div>
          <label htmlFor={`step-${step.id}-actionType`}>Action Type:</label>
          {step.actionType}
        </div>
        <textarea
          name={`step-${step.id}-actionMessage`}
          id={`step-${step.id}-actionMessage`}
          defaultValue={step.actionMessage || undefined}
          cols={60}
          rows={10}
        ></textarea>
      </div>
    </div>
  );
}
