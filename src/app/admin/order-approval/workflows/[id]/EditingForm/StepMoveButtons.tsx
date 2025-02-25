import styles from "@/styles/orderApproval/orderApproval.module.css";
import { moveWorkflowStep } from "@/actions/orderWorkflow/misc";
import { useEditingContext } from "../WorkflowEditingContext";

type Props = {
  stepId: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
};
export function StepMoveButtons({ stepId, canMoveDown, canMoveUp }: Props) {
  const { setWorkflowState } = useEditingContext();

  async function onClickMove(direction: "earlier" | "later") {
    const { movedStep, swappedStep } = await moveWorkflowStep(
      stepId,
      direction
    );

    setWorkflowState((draft) => {
      const movedStepInState = draft.steps.find(
        (step) => step.id === movedStep.id
      );
      if (!movedStepInState) {
        console.error(`Step ID ${stepId} not found in state`);
        return;
      }

      const swappedStepInState = draft.steps.find(
        (step) => step.id === swappedStep.id
      );
      if (!swappedStepInState) {
        console.error(`Step ID ${stepId} not found in state`);
        return;
      }

      movedStepInState.order = movedStep.order;
      swappedStepInState.order = swappedStep.order;
    });
  }

  return (
    <div className={styles["single-step-move-buttons-container"]}>
      {canMoveUp && (
        <button
          type="button"
          className="button-small"
          onClick={() => onClickMove("earlier")}
        >
          ^ Move Up
        </button>
      )}
      {canMoveDown && (
        <button
          type="button"
          className="button-small"
          onClick={() => onClickMove("later")}
        >
          v Move Down
        </button>
      )}
    </div>
  );
}
