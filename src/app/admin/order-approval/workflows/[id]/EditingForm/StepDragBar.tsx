import { OrderWorkflowStep } from "@prisma/client";
import { useEditingContext } from "../WorkflowEditingContext";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  step: OrderWorkflowStep;
};
export function StepDragBar({ step }: Props) {
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

  function onClickDelete() {
    if (!syncedWithServer) return;

    if (confirm("Are you sure you want to delete this step?"))
      deleteStep(step.id);
  }

  return (
    <>
      <input
        type="text"
        value={step.name}
        onChange={(e) => onChangeName(e.target.value)}
      />
      <button
        className={`${styles["delete-step-button"]} button-danger`}
        disabled={!syncedWithServer}
        title={
          !syncedWithServer
            ? "Save your changes before deleting a step!"
            : undefined
        }
        onMouseUp={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onClickDelete}
      >
        <FontAwesomeIcon icon={faTrashAlt} size="xs" />
      </button>
    </>
  );
}
