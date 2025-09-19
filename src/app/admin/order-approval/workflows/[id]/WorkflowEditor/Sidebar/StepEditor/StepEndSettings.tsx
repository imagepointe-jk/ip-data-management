import styles from "@/styles/orderApproval/orderApproval.module.css";
import { EventListener } from "./EventListener";
import { createEventListener } from "@/actions/orderWorkflow/create";
import { useEditingContext } from "../../../WorkflowEditingContext";
import { ProceedListenerDTO, StepDTO } from "@/types/dto/orderApproval";

type Props = {
  step: StepDTO & { proceedListeners: ProceedListenerDTO[] };
};
export function StepEndSettings({ step }: Props) {
  const { workflowState, updateWorkflowState, workflowUsers } =
    useEditingContext();
  const waitForEvent = step.proceedImmediatelyTo === null;
  const stepOptions = workflowState.steps.filter(
    (stepOption) => stepOption.id !== step.id
  );
  stepOptions.sort((a, b) => a.order - b.order);

  function onChangeWaitOrGo(value: "wait" | "goto") {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep)
        draftStep.proceedImmediatelyTo = value === "wait" ? null : "next";
    });
  }

  function onChangeProceedImmediately(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.proceedImmediatelyTo = value;
    });
  }

  async function onClickAddListener() {
    const defaultNewFromValue = workflowUsers[0]?.email || "INVALID FROM VALUE";
    const createdListener = await createEventListener(
      step.id,
      defaultNewFromValue
    );
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.proceedListeners.push(createdListener);
    });
  }

  return (
    <div className="content-frame-minor">
      <div>
        After this step,{" "}
        <select
          value={step.proceedImmediatelyTo ? "goto" : "wait"}
          onChange={(e) =>
            onChangeWaitOrGo(e.target.value === "wait" ? "wait" : "goto")
          }
        >
          <option value="wait">wait for an event</option>
          <option value="goto">go to</option>
        </select>
        {!waitForEvent && (
          <select
            value={step.proceedImmediatelyTo || ""}
            onChange={(e) => onChangeProceedImmediately(e.target.value)}
          >
            <option value="next">the next step</option>
            {stepOptions.map((step) => (
              <option key={step.id} value={step.order}>
                Step {step.order} - {step.name}
              </option>
            ))}
          </select>
        )}
        {waitForEvent && (
          <>
            <h4>Event Listeners:</h4>
            <div className={styles["event-listeners-container"]}>
              {step.proceedListeners.map((listener) => (
                <EventListener
                  key={listener.id}
                  stepId={step.id}
                  listener={listener}
                />
              ))}
            </div>
            <button onClick={onClickAddListener}>+ Add Listener</button>
          </>
        )}
      </div>
    </div>
  );
}
