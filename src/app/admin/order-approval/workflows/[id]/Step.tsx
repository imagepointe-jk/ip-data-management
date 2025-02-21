import {
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
  OrderWorkflowUser,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { createEventListener } from "@/actions/orderWorkflow/create";
import { deleteStep } from "@/actions/orderWorkflow/delete";
import { moveWorkflowStep } from "@/actions/orderWorkflow/misc";
import {
  orderWorkflowActionTypes,
  OrderWorkflowUserRole,
} from "@/types/schema/orderApproval";
import { makeStringTitleCase } from "@/utility/misc";
import { EventListener } from "./EventListener";

type StepProps = {
  workflowUsers: (OrderWorkflowUser & { role: OrderWorkflowUserRole })[];
  step: OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  };
  canBeMovedUp: boolean;
  canBeMovedDown: boolean;
};
export function Step({
  step,
  workflowUsers,
  canBeMovedDown,
  canBeMovedUp,
}: StepProps) {
  const isProceedImmediatelyInitiallySelected =
    step.proceedImmediatelyTo !== null;
  const isProceedImmediatelyInitiallyNext =
    step.proceedImmediatelyTo === "next";

  const [stepState, setStepState] = useState(step);
  const [waitForEvent, setWaitForEvent] = useState(
    !isProceedImmediatelyInitiallySelected
  );
  const [proceedImmediatelyType, setProceedImmediatelyType] = useState(
    step.proceedImmediatelyTo === "next" ? "next" : "step"
  );
  const router = useRouter();

  const showActionTarget = stepState.actionType === "email";
  const nameField = `step-${step.id}-name`;
  const actionTypeField = `step-${step.id}-actionType`;
  const actionTargetField = `step-${step.id}-actionTarget`;
  const otherActionTargetsField = `step-${step.id}-otherActionTargets`;
  const actionSubjectField = `step-${step.id}-actionSubject`;
  const actionMessageField = `step-${step.id}-actionMessage`;
  const proceedImmediatelyField = `step-${step.id}-proceedImmediatelyTo`;

  function onChangeActionType(e: ChangeEvent<HTMLSelectElement>) {
    setStepState({
      ...stepState,
      actionType: e.target.value,
    });
  }

  function onChangeWaitOrGo(e: ChangeEvent<HTMLSelectElement>) {
    setWaitForEvent(e.target.value === "wait");
  }

  function onChangeProceedImmediatelyType(e: ChangeEvent<HTMLSelectElement>) {
    setProceedImmediatelyType(e.target.value === "next" ? "next" : "step");
  }

  async function onClickAddListener() {
    await createEventListener(step.id, workflowUsers[0]?.email || "(none)");
    router.refresh();
  }

  async function onClickDeleteStep() {
    await deleteStep(step.id);
    router.refresh();
  }

  async function onClickMove(direction: "earlier" | "later") {
    await moveWorkflowStep(step.id, direction);
    router.refresh();
  }

  return (
    <div className={styles["single-step-container"]}>
      <div className={styles["single-step-top-row"]}>
        <div>Step #{step.order}</div>
        <div className={styles["single-step-move-buttons-container"]}>
          {canBeMovedUp && (
            <button
              type="button"
              className="button-small"
              onClick={() => onClickMove("earlier")}
            >
              ^ Move Up
            </button>
          )}
          {canBeMovedDown && (
            <button
              type="button"
              className="button-small"
              onClick={() => onClickMove("later")}
            >
              v Move Down
            </button>
          )}
        </div>
      </div>
      <h3>
        <div>Name</div>
        <input
          type="text"
          name={nameField}
          id={nameField}
          defaultValue={step.name}
          className="input-major"
        />
      </h3>
      <details>
        <summary>Show more</summary>
        <div className="input-label">Action Settings</div>
        <div className="input-group content-frame-minor">
          <div>
            {/* Action Type */}

            <label htmlFor={actionTypeField} className="input-label">
              Action Type
            </label>
            <select
              name={actionTypeField}
              id={actionTypeField}
              defaultValue={step.actionType}
              onChange={onChangeActionType}
            >
              {orderWorkflowActionTypes.map((type) => (
                <option key={type} value={type}>
                  {makeStringTitleCase(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Target */}

          <div style={{ display: !showActionTarget ? "none" : undefined }}>
            <label htmlFor={actionTargetField} className="input-label">
              Action Target
            </label>
            <select
              name={actionTargetField}
              id={actionTargetField}
              defaultValue={step.actionTarget || undefined}
            >
              {[
                <option key={-1} value={undefined}>
                  (none)
                </option>,
                ...workflowUsers
                  .filter((user) => user.role === "approver")
                  .map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.name}
                    </option>
                  )),
                <option key="purchaser" value="purchaser">
                  Purchaser
                </option>,
              ]}
            </select>
          </div>

          {/* Other action targets */}

          <div style={{ display: !showActionTarget ? "none" : undefined }}>
            <label htmlFor={otherActionTargetsField} className="input-label">
              Other Action Targets (separate with {";"})
            </label>
            <input
              type="text"
              name={otherActionTargetsField}
              id={otherActionTargetsField}
              defaultValue={step.otherActionTargets || undefined}
              style={{ width: "500px" }}
            />
          </div>

          {/* Action Subject */}

          <div style={{ display: !showActionTarget ? "none" : undefined }}>
            <label htmlFor={actionSubjectField} className="input-label">
              Action Subject
            </label>
            <input
              type="text"
              name={actionSubjectField}
              id={actionSubjectField}
              defaultValue={step.actionSubject || undefined}
            />
          </div>

          {/* Action Message */}

          <div style={{ display: !showActionTarget ? "none" : undefined }}>
            <label htmlFor={actionMessageField} className="input-label">
              Action Message
            </label>
            <textarea
              name={actionMessageField}
              id={actionMessageField}
              defaultValue={step.actionMessage || undefined}
              cols={60}
              rows={10}
            ></textarea>
          </div>
        </div>
        <div
          className="content-frame-minor"
          style={{ marginTop: "10px", marginBottom: "10px" }}
        >
          {/* "Proceed Immediately" Behavior */}

          <div>
            After this step,{" "}
            <select
              onChange={onChangeWaitOrGo}
              defaultValue={
                isProceedImmediatelyInitiallySelected ? "goto" : "wait"
              }
            >
              <option value="wait">wait for an event</option>
              <option value="goto">go to</option>
            </select>
            {!waitForEvent && (
              <select
                onChange={onChangeProceedImmediatelyType}
                defaultValue={
                  isProceedImmediatelyInitiallySelected &&
                  isProceedImmediatelyInitiallyNext
                    ? "next"
                    : "step"
                }
              >
                <option value="next">the next step</option>
                <option value="step">step number</option>
              </select>
            )}
            {!waitForEvent && proceedImmediatelyType === "step" && (
              <input
                name={proceedImmediatelyField}
                id={proceedImmediatelyField}
                type="number"
                defaultValue={step.proceedImmediatelyTo || undefined}
              />
            )}
            {!waitForEvent && proceedImmediatelyType === "next" && (
              // A hidden input field that passes along the value of "next".
              // It shares an id with the other "goto" field and they should be mutually exclusive,
              // based on whether "the next step" option is selected.
              <input
                name={proceedImmediatelyField}
                id={proceedImmediatelyField}
                type="text"
                value="next"
                readOnly={true}
                style={{ display: "none" }}
              />
            )}
          </div>

          {/* Event Listener Section */}

          {waitForEvent && (
            <>
              <h4>Event Listeners:</h4>
              <div className={styles["event-listeners-container"]}>
                {step.proceedListeners.map((listener) => (
                  <EventListener
                    key={listener.id}
                    listener={listener}
                    workflowUsers={workflowUsers}
                  />
                ))}
              </div>
              <button onClick={onClickAddListener} type="button">
                + Add Listener
              </button>
            </>
          )}
        </div>
      </details>
      <button
        type="button"
        className="button-danger"
        onClick={onClickDeleteStep}
      >
        Delete
      </button>
    </div>
  );
}
