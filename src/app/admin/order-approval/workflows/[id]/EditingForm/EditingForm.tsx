"use client";

import { createStep } from "@/actions/orderWorkflow/create";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";
import { ChangeEvent } from "react";
import { useEditingContext } from "../WorkflowEditingContext";
import { Step } from "./Step";

export function EditingForm() {
  const { workflowState, updateWorkflowState, loading, saveChanges } =
    useEditingContext();
  const sorted = [...workflowState.steps];
  sorted.sort((a, b) => a.order - b.order);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  function onChangeName(e: ChangeEvent<HTMLInputElement>) {
    updateWorkflowState((draft) => {
      draft.name = e.target.value;
    });
  }

  async function onClickAddStep() {
    const currentLastStep = sorted[sorted.length - 1];
    const orderToUse = currentLastStep ? currentLastStep.order + 1 : 0;

    const step = await createStep(workflowState.id, orderToUse);
    updateWorkflowState((draft) => {
      draft.steps.push({ ...step, proceedListeners: [] });
    });
  }

  return (
    <div className="vert-flex-group" style={{ position: "relative" }}>
      <Link href={`${workflowState.id}/instances`}>
        View {workflowState.instances.length} instance(s)
      </Link>
      <h2>
        Name:{" "}
        <input
          type="text"
          name="name"
          id="name"
          value={workflowState.name}
          onChange={onChangeName}
          className="input-major"
        />
      </h2>
      <div className="vert-flex-group">
        {sorted.map((step) => (
          <Step
            key={step.id}
            step={step}
            canBeMovedDown={step.id !== last?.id}
            canBeMovedUp={step.id !== first?.id}
          />
        ))}
      </div>
      <div>
        <button type="button" onClick={onClickAddStep}>
          + Add Step
        </button>
      </div>
      <button className={styles["save-changes-button"]} onClick={saveChanges}>
        Save Changes
      </button>
      <div
        className={`${styles["loading-blocker"]} ${
          loading ? styles["loading"] : ""
        }`}
      ></div>
    </div>
  );
}
