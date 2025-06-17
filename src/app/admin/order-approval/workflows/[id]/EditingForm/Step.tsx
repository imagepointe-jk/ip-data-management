import { DraggableDiv } from "@/components/DraggableDiv/DraggableDiv";
import {
  OrderWorkflowStep,
  OrderWorkflowStepDisplay,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { useEditingContext } from "../WorkflowEditingContext";
import { StepDragBar } from "./StepDragBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { StepActionSettings } from "./StepActionSettings";
import { StepEndSettings } from "./StepEndSettings";

type Props = {
  step: OrderWorkflowStep & {
    display: OrderWorkflowStepDisplay | null;
    proceedListeners: OrderWorkflowStepProceedListener[];
  };
  expanded: boolean;
  highlighted: boolean;
  onClickExpand: (stepId: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};
export function Step({
  step,
  expanded,
  highlighted,
  onClickExpand,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const { updateWorkflowState } = useEditingContext();
  const initialPosition = step.display
    ? { x: step.display.positionX, y: step.display.positionY }
    : undefined;

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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        zIndex: expanded ? 1 : "initial",
        width: expanded ? "600px" : "300px",
      }}
    >
      <div
        className={styles["expandable-container"]}
        style={{
          overflow: "hidden",
          height: expanded ? "initial" : 0,
        }}
      >
        <div className="vert-flex-group">
          <StepActionSettings step={step} />

          {/* Proceed behavior */}

          <StepEndSettings step={step} />
        </div>
      </div>
      <button
        className={styles["expand-button"]}
        onClick={() => onClickExpand(step.id)}
      >
        <FontAwesomeIcon icon={expanded ? faMinus : faPlus} />
        {`${expanded ? " Show Less" : " Show More"}`}
      </button>
      <div className={styles["step-id"]}>id: {step.id}</div>
    </DraggableDiv>
  );
}
