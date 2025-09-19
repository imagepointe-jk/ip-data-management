"use client";

import { deleteEventListener } from "@/actions/orderWorkflow/delete";
import { orderWorkflowEventTypes } from "@/types/schema/orderApproval";
import { useEditingContext } from "../../../WorkflowEditingContext";
import { ProceedListenerDTO } from "@/types/dto/orderApproval";

type Props = {
  stepId: number;
  listener: ProceedListenerDTO;
};
export function EventListener({ stepId, listener }: Props) {
  const { workflowUsers, workflowState, updateWorkflowState } =
    useEditingContext();
  const stepOptions = workflowState.steps.filter(
    (stepOption) => stepOption.id !== stepId
  );
  stepOptions.sort((a, b) => a.order - b.order);

  function onChangeName(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === stepId
      );
      if (!draftStep) return;

      const draftListener = draftStep.proceedListeners.find(
        (draftListener) => draftListener.id === listener.id
      );
      if (draftListener) draftListener.name = value;
    });
  }

  function onChangeType(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === stepId
      );
      if (!draftStep) return;

      const draftListener = draftStep.proceedListeners.find(
        (draftListener) => draftListener.id === listener.id
      );
      if (draftListener) draftListener.type = value;
    });
  }

  function onChangeFromValue(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === stepId
      );
      if (!draftStep) return;

      const draftListener = draftStep.proceedListeners.find(
        (draftListener) => draftListener.id === listener.id
      );
      if (draftListener) draftListener.from = value;
    });
  }

  function onChangeGoToValue(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === stepId
      );
      if (!draftStep) return;

      const draftListener = draftStep.proceedListeners.find(
        (draftListener) => draftListener.id === listener.id
      );
      if (draftListener) draftListener.goto = value;
    });
  }

  async function onClickDelete() {
    if (!confirm("Are you sure you want to delete this event listener?"))
      return;

    await deleteEventListener(listener.id);
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === stepId
      );
      if (draftStep)
        draftStep.proceedListeners = draftStep.proceedListeners.filter(
          (draftListener) => draftListener.id !== listener.id
        );
    });
  }

  return (
    <div className="content-frame-minor vert-flex-group">
      <div>
        <div className="input-label">Name</div>
        <input
          type="text"
          value={listener.name}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </div>
      <div>
        <div className="input-label">
          When the following event type is received...
        </div>
        <select
          value={listener.type}
          onChange={(e) => onChangeType(e.target.value)}
        >
          {orderWorkflowEventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">...from the following person...</label>
        <select
          value={listener.from}
          onChange={(e) => onChangeFromValue(e.target.value)}
        >
          {[
            ...workflowUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name}
              </option>
            )),
            <option key={"approver"} value="approver">
              Approver
            </option>,
          ]}
        </select>{" "}
      </div>
      <div>
        <div className="input-label">...go to...</div>
        <select
          value={listener.goto}
          onChange={(e) => onChangeGoToValue(e.target.value)}
        >
          <option value="next">the next step</option>
          {stepOptions.map((step) => (
            <option key={step.id} value={step.order}>
              Step {step.order} - {step.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button className="button-danger button-small" onClick={onClickDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
