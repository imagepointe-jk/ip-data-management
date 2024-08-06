"use client";

import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import {
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
  OrderWorkflowUser,
} from "@prisma/client";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import {
  orderWorkflowActionTypes,
  orderWorkflowEventTypes,
} from "@/types/schema";
import { makeStringTitleCase } from "@/utility/misc";
import { ChangeEvent, useState } from "react";
import {
  createEventListener,
  createStep,
  deleteEventListener,
  deleteStep,
  moveWorkflowStep,
  updateWorkflow,
} from "@/actions/orderWorkflow";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  workflow: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
};
export function EditingForm({ workflow }: Props) {
  const router = useRouter();
  const sorted = [...workflow.steps];
  sorted.sort((a, b) => a.order - b.order);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  async function onClickAddStep() {
    const currentLastStep = sorted[sorted.length - 1];
    const orderToUse = currentLastStep ? currentLastStep.order + 1 : 0;

    await createStep(workflow.id, orderToUse);
    router.refresh();
  }

  async function onSubmit(e: FormData) {
    await updateWorkflow(e);
    router.refresh();
  }

  return (
    <form action={(e) => onSubmit(e)}>
      {workflow.instances.length > 0 && (
        <Link href={`${workflow.id}/instances`}>
          View {workflow.instances.length} instance(s)
        </Link>
      )}
      <h2>
        Name:{" "}
        <input type="text" name="name" id="name" defaultValue={workflow.name} />
      </h2>
      <div className={styles["steps-container"]}>
        {sorted.map((step) => (
          <Step
            key={step.id}
            step={step}
            workflowUsers={workflow.webstore.users}
            canBeMovedDown={step.id !== last?.id}
            canBeMovedUp={step.id !== first?.id}
          />
        ))}
      </div>
      {<input type="hidden" name="existingWorkflowId" value={workflow.id} />}
      <button type="button" onClick={onClickAddStep}>
        + Add Step
      </button>
      <button type="submit">Save Changes</button>
    </form>
  );
}

type StepProps = {
  workflowUsers: OrderWorkflowUser[];
  step: OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  };
  canBeMovedUp: boolean;
  canBeMovedDown: boolean;
};
function Step({
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
      <div>
        Step #{step.order}
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
      <h3>
        Name:{" "}
        <input
          type="text"
          name={nameField}
          id={nameField}
          defaultValue={step.name}
        />
      </h3>
      <div>
        {/* Action Type */}

        <label htmlFor={actionTypeField}>Action Type</label>
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
        <label htmlFor={actionTargetField}>Action Target</label>
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
              .filter((user) => user.isApprover)
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

      {/* Action Subject */}

      <div style={{ display: !showActionTarget ? "none" : undefined }}>
        <label htmlFor={actionSubjectField}>Action Subject</label>
        <input
          type="text"
          name={actionSubjectField}
          id={actionSubjectField}
          defaultValue={step.actionSubject || undefined}
        />
      </div>

      {/* Action Message */}

      <div style={{ display: !showActionTarget ? "none" : undefined }}>
        <label htmlFor={actionMessageField}>Action Message</label>
        <textarea
          name={actionMessageField}
          id={actionMessageField}
          defaultValue={step.actionMessage || undefined}
          cols={60}
          rows={10}
        ></textarea>
      </div>

      {/* "Proceed Immediately" Behavior */}

      <div>
        After this step,{" "}
        <select
          onChange={onChangeWaitOrGo}
          defaultValue={isProceedImmediatelyInitiallySelected ? "goto" : "wait"}
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
        <div className={styles["step-subcontainer"]}>
          <h4>Event Listeners</h4>
          {step.proceedListeners.map((listener) => (
            <EventListener
              key={listener.id}
              listener={listener}
              workflowUsers={workflowUsers}
            />
          ))}
          <button onClick={onClickAddListener} type="button">
            + Add Listener
          </button>
        </div>
      )}
      <button
        type="button"
        className="button-danger"
        onClick={onClickDeleteStep}
      >
        Delete &quot;{step.name}&quot;
      </button>
    </div>
  );
}

type EventListenerProps = {
  listener: OrderWorkflowStepProceedListener;
  workflowUsers: OrderWorkflowUser[];
};
function EventListener({ listener, workflowUsers }: EventListenerProps) {
  const goToNextIsInitiallySelected =
    !listener.goto || listener.goto === "next";
  const [showGoToField, setShowGoToField] = useState(
    !goToNextIsInitiallySelected
  );
  const router = useRouter();
  const nameField = `step-${listener.stepId}-listener-${listener.id}-name`;
  const typeField = `step-${listener.stepId}-listener-${listener.id}-type`;
  const fromField = `step-${listener.stepId}-listener-${listener.id}-from`;
  const gotoField = `step-${listener.stepId}-listener-${listener.id}-goto`;

  function onChangeGoToOption(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === "next") setShowGoToField(false);
    else setShowGoToField(true);
  }

  async function onClickDelete() {
    await deleteEventListener(listener.id);
    router.refresh();
  }

  return (
    <div className={styles["step-subcontainer"]}>
      <div>
        <label htmlFor={nameField}>Name</label>
        <input
          type="text"
          name={nameField}
          id={nameField}
          defaultValue={listener.name}
        />
      </div>
      <div>
        <div>
          When a(n){" "}
          <select name={typeField} id={typeField} defaultValue={listener.type}>
            {orderWorkflowEventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>{" "}
          event is received...
        </div>
        <div>
          from{" "}
          <select name={fromField} id={fromField} defaultValue={listener.from}>
            {[
              ...workflowUsers.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.name}
                </option>
              )),
              <option key="purchaser" value="purchaser">
                Purchaser
              </option>,
            ]}
          </select>{" "}
          ...
        </div>
        <div>
          go to{" "}
          <select
            onChange={onChangeGoToOption}
            defaultValue={goToNextIsInitiallySelected ? "next" : "step"}
          >
            <option value="next">the next step</option>
            <option value="step">step number</option>
          </select>
          {showGoToField && (
            <input
              type="number"
              name={gotoField}
              id={gotoField}
              defaultValue={listener.goto}
            />
          )}
          {!showGoToField && (
            // A hidden input field that passes along the value of "next".
            // It shares an id with the other "goto" field and they should be mutually exclusive,
            // based on whether "the next step" option is selected.
            <input
              type="text"
              name={gotoField}
              id={gotoField}
              value="next"
              readOnly={true}
              style={{ display: "none" }}
            />
          )}
        </div>
        <button
          className="button-danger button-small"
          onClick={onClickDelete}
          type="button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
