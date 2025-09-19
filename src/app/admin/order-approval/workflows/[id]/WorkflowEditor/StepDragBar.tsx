// import { OrderWorkflowStep } from "@prisma/client";
import { useEditingContext } from "../WorkflowEditingContext";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  step: {
    id: number;
    name: string;
  };
};
export function StepDragBar({ step }: Props) {
  const { syncedWithServer, deleteStep } = useEditingContext();

  function onClickDelete() {
    if (!syncedWithServer) return;

    if (confirm("Are you sure you want to delete this step?"))
      deleteStep(step.id);
  }

  return (
    <>
      {step.name}
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
