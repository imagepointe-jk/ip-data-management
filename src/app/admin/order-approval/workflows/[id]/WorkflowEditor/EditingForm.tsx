"use client";

import { createStep } from "@/actions/orderWorkflow/create";
import styles from "@/styles/orderApproval/admin/workflowEditor.module.css";
import Link from "next/link";
import { ChangeEvent } from "react";
import { useEditingContext } from "../WorkflowEditingContext";
import { Step } from "./Step";
import { ConnectionLines } from "./ConnectionLines";
import { createConnectionLines } from "./helpers/helpers";

export function EditingForm() {
  const { workflowState, updateWorkflowState, loading, saveChanges } =
    useEditingContext();
  const sorted = [...workflowState.steps];
  sorted.sort((a, b) => a.order - b.order);

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

  function onChangeFirstStep(id: number) {
    updateWorkflowState((draft) => {
      const step = draft.steps.find((step) => step.id === id);
      if (!step) return;
      draft.firstStep = step;
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
      <div>
        First Step (currently unused):{" "}
        <select
          onChange={(e) => onChangeFirstStep(+e.target.value)}
          value={workflowState.firstStep?.id}
        >
          {[
            <option key={0}></option>,
            ...workflowState.steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name}
              </option>
            )),
          ]}
        </select>
      </div>
      <div className={styles["steps-workspace"]}>
        <ConnectionLines lines={createConnectionLines(workflowState.steps)} />
        {sorted.map((step) => (
          <Step key={step.id} step={step} />
        ))}
      </div>
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
      <div
        className={`${styles["loading-blocker"]} ${
          loading ? styles["loading"] : ""
        }`}
      ></div>
    </div>
  );
}
