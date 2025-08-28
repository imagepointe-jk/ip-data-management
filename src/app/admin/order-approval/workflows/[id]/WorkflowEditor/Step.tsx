import { DraggableDiv } from "@/components/DraggableDiv/DraggableDiv";
import {
  OrderWorkflowStep,
  OrderWorkflowStepDisplay,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { useEditingContext } from "../WorkflowEditingContext";
import { StepDragBar } from "./StepDragBar";

type Props = {
  step: OrderWorkflowStep & {
    display: OrderWorkflowStepDisplay | null;
    proceedListeners: OrderWorkflowStepProceedListener[];
  };
};
export function Step({ step }: Props) {
  const { updateWorkflowState, selectedStepId, setSelectedStepId } =
    useEditingContext();
  const initialPosition = step.display
    ? { x: step.display.positionX, y: step.display.positionY }
    : undefined;
  const highlighted = selectedStepId === step.id;

  function onChangePosition(position: { x: number; y: number }) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep && draftStep.display) {
        draftStep.display.positionX = position.x;
        draftStep.display.positionY = position.y;
      }
    });

    setSelectedStepId(step.id);
  }

  return (
    <DraggableDiv
      initialPosition={initialPosition}
      dragBarChildren={<StepDragBar step={step} />}
      className={`${styles["single-step-container"]} ${
        highlighted ? styles["highlighted"] : undefined
      }`}
      contentContainerClassName={styles["single-step-content-container"]}
      dragBarClassName={styles["single-step-drag-bar"]}
      onDragFinish={onChangePosition}
    >
      <div className={styles["step-id"]}>id: {step.id}</div>
    </DraggableDiv>
  );
}
