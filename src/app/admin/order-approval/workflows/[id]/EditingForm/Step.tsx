import styles from "@/styles/orderApproval/orderApproval.module.css";
import {
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import { useEditingContext } from "../WorkflowEditingContext";
import { StepActionSettings } from "./StepActionSettings";
import { StepEndSettings } from "./StepEndSettings";
import { StepMoveButtons } from "./StepMoveButtons";

type StepProps = {
  step: OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  };
  canBeMovedUp: boolean;
  canBeMovedDown: boolean;
};
export function Step({ step, canBeMovedDown, canBeMovedUp }: StepProps) {
  const { updateWorkflowState, syncedWithServer, deleteStep } =
    useEditingContext();

  function onChangeName(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.name = value;
    });
  }

  return (
    <div className={styles["single-step-container"]}>
      <div className={styles["single-step-top-row"]}>
        <div>Step #{step.order}</div>
        <StepMoveButtons
          stepId={step.id}
          canMoveDown={canBeMovedDown}
          canMoveUp={canBeMovedUp}
        />
      </div>
      <h3>
        <div>Name</div>
        <input
          type="text"
          value={step.name}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </h3>
      <details>
        <summary>Show more</summary>
        <div className="vert-flex-group">
          <StepActionSettings step={step} />

          {/* Proceed behavior */}

          <StepEndSettings step={step} />
        </div>
      </details>
      <div>
        <button
          className="button-danger"
          disabled={!syncedWithServer}
          onClick={() => {
            if (confirm("Are you sure you want to delete this step?"))
              deleteStep(step.id);
          }}
        >
          Delete
        </button>
        {!syncedWithServer && (
          <span style={{ color: "red" }}>
            Save your changes before deleting a step!
          </span>
        )}
      </div>
    </div>
  );
}
