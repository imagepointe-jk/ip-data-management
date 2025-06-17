"use client";

import { createStep } from "@/actions/orderWorkflow/create";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useEditingContext } from "../WorkflowEditingContext";
import { Step } from "./Step";

export function EditingForm() {
  const { workflowState, updateWorkflowState, loading, saveChanges } =
    useEditingContext();
  const [expandedStepIds, setExpandedStepIds] = useState<number[]>([]);
  const sorted = [...workflowState.steps];
  sorted.sort((a, b) => a.order - b.order); //sorting might not be necessary anymore with the positionable step functionality
  // const first = sorted[0];
  // const last = sorted[sorted.length - 1];

  function onToggleStepExpanded(stepId: number) {
    if (expandedStepIds.includes(stepId)) setExpandedStepIds([]);
    else setExpandedStepIds([stepId]);
    //currently only allows one step to be expanded at a time, but this could be easily changed later
  }

  function onChangeName(e: ChangeEvent<HTMLInputElement>) {
    updateWorkflowState((draft) => {
      draft.name = e.target.value;
    });
  }

  async function onClickAddStep() {
    const currentLastStep = sorted[sorted.length - 1];
    const orderToUse = currentLastStep ? currentLastStep.order + 1 : 0;

    const step = await createStep(workflowState.id, orderToUse);
    const createdDisplay = step.display;
    if (!createdDisplay)
      throw new Error("Display data not created during step creation");

    updateWorkflowState((draft) => {
      draft.steps.push({
        ...step,
        proceedListeners: [],
        display: createdDisplay,
      });
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
      <div className={styles["steps-workspace"]}>
        {sorted.map((step) => (
          <Step
            key={step.id}
            step={step}
            expanded={expandedStepIds.includes(step.id)}
            onClickExpand={onToggleStepExpanded}
          />
        ))}
      </div>
      {/* <div className="vert-flex-group">
        {sorted.map((step) => (
          <Step
            key={step.id}
            step={step}
            canBeMovedDown={step.id !== last?.id}
            canBeMovedUp={step.id !== first?.id}
          />
        ))}
      </div> */}
      <div className={styles["floating-buttons-container"]}>
        <button
          type="button"
          className={styles["add-step-button"]}
          onClick={onClickAddStep}
        >
          + Add Step
        </button>
        <button className={styles["save-changes-button"]} onClick={saveChanges}>
          Save Changes
        </button>
      </div>
      {/* <div>
        <button type="button" onClick={onClickAddStep}>
          + Add Step
        </button>
      </div>
      <button className={styles["save-changes-button"]} onClick={saveChanges}>
        Save Changes
      </button> */}
      <div
        className={`${styles["loading-blocker"]} ${
          loading ? styles["loading"] : ""
        }`}
      ></div>
    </div>
  );
}
