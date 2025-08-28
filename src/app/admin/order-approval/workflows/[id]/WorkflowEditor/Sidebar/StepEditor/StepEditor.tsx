import { StepActionSettings } from "./StepActionSettings";
import { StepEndSettings } from "./StepEndSettings";
import { useEditingContext } from "../../../WorkflowEditingContext";

export function StepEditor() {
  const { selectedStepId, workflowState, updateWorkflowState } =
    useEditingContext();
  const step = workflowState.steps.find((step) => step.id === selectedStepId);

  function onChangeName(value: string) {
    if (!step) return;

    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.name = value;
    });
  }

  return (
    <>
      {selectedStepId === null && "Select a step to start editing."}
      {selectedStepId === null &&
        step !== undefined &&
        `ERROR: Step id ${selectedStepId} not found in state.`}
      {step !== undefined && (
        <div
          className="vert-flex-group"
          style={{ overflow: "auto", height: "90%" }}
        >
          <div>
            <input
              type="text"
              value={step.name}
              onChange={(e) => onChangeName(e.target.value)}
            />
          </div>
          <StepActionSettings step={step} />
          <StepEndSettings step={step} />
        </div>
      )}
    </>
  );
}
