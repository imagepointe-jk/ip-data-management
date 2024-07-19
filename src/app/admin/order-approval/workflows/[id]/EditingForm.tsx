"use client";

import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import {
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import {
  orderWorkflowActionTypes,
  orderWorkflowEventTypes,
  orderWorkflowUserRoles,
} from "@/types/schema";
import { makeStringTitleCase } from "@/utility/misc";
import { ChangeEvent, useState } from "react";

type Props = {
  existingWorkflow: UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>;
};
export function EditingForm({ existingWorkflow }: Props) {
  const sorted = existingWorkflow ? [...existingWorkflow.steps] : [];
  sorted.sort((a, b) => a.order - b.order);

  return (
    <>
      <h2>
        Name:{" "}
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={existingWorkflow ? existingWorkflow.name : undefined}
        />
      </h2>
      <div className={styles["steps-container"]}>
        {sorted.map((step) => (
          <Step key={step.id} step={step} />
        ))}
      </div>
    </>
  );
}

type StepProps = {
  step: OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  };
};
function Step({ step }: StepProps) {
  const isProceedImmediatelyInitiallySelected =
    step.proceedImmediatelyTo !== null;
  const isProceedImmediatelyInitiallyNext =
    step.proceedImmediatelyTo === "next";
  const userTargetableActionInitiallySelected = isActionTypeTargetable(
    step.actionType
  ); //was an action type initially selected for which an action target makes sense?
  const [showActionTarget, setShowActionTarget] = useState(
    userTargetableActionInitiallySelected
  );
  const [showImmediateProceedType, setShowImmediateProceedType] = useState(
    isProceedImmediatelyInitiallySelected
  );
  const [showGoToStepNumber, setShowGoToStepNumber] = useState(
    isProceedImmediatelyInitiallySelected && !isProceedImmediatelyInitiallyNext
  );
  const actionTypeField = `step-${step.id}-actionType`;
  const actionTargetField = `step-${step.id}-actionTarget`;
  const actionMessageField = `step-${step.id}-actionMessage`;
  const proceedImmediatelyField = `step-${step.id}-proceedImmediatelyTo`;

  function isActionTypeTargetable(type: string) {
    //there may eventually be more than one "targetable" action type
    return type === "email";
  }

  function onChangeActionType(e: ChangeEvent<HTMLSelectElement>) {
    setShowActionTarget(isActionTypeTargetable(e.target.value));
  }

  function onChangeWaitOrGo(e: ChangeEvent<HTMLSelectElement>) {
    setShowImmediateProceedType(e.target.value === "goto");
  }

  function onChangeProceedImmediatelyType(e: ChangeEvent<HTMLSelectElement>) {
    setShowGoToStepNumber(e.target.value === "step");
  }

  return (
    <div className={styles["single-step-container"]}>
      <h3>{step.name}</h3>
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
        <select name={actionTargetField} id={actionTargetField}>
          {orderWorkflowUserRoles.map((role) => (
            <option key={role} value={role}>
              {makeStringTitleCase(role)}
            </option>
          ))}
        </select>
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
        <select
          onChange={onChangeProceedImmediatelyType}
          defaultValue={
            isProceedImmediatelyInitiallySelected &&
            isProceedImmediatelyInitiallyNext
              ? "next"
              : "step"
          }
          style={{ display: !showImmediateProceedType ? "none" : undefined }}
        >
          <option value="next">the next step</option>
          <option value="step">step number</option>
        </select>
        {showGoToStepNumber && (
          <input
            name={proceedImmediatelyField}
            id={proceedImmediatelyField}
            type="number"
            defaultValue={step.proceedImmediatelyTo || undefined}
            style={{ display: !showImmediateProceedType ? "none" : undefined }}
          />
        )}
        {!showGoToStepNumber && (
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

      <div
        className={styles["step-subcontainer"]}
        style={{ display: showImmediateProceedType ? "none" : undefined }}
      >
        <h4>Event Listeners</h4>
        {step.proceedListeners.map((listener) => (
          <EventListener
            key={`${listener.type}-${listener.from}`}
            listener={listener}
          />
        ))}
      </div>
    </div>
  );
}

type EventListenerProps = {
  listener: OrderWorkflowStepProceedListener;
};
function EventListener({ listener }: EventListenerProps) {
  const goToNextIsInitiallySelected =
    !listener.goto || listener.goto === "next";
  const [showGoToField, setShowGoToField] = useState(
    !goToNextIsInitiallySelected
  );
  const nameField = `step-${listener.stepId}-listener-${listener.type}-${listener.from}-name`;
  const typeField = `step-${listener.stepId}-listener-${listener.type}-${listener.from}-type`;
  const fromField = `step-${listener.stepId}-listener-${listener.type}-${listener.from}-from`;
  const gotoField = `step-${listener.stepId}-listener-${listener.type}-${listener.from}-goto`;

  function onChangeGoToOption(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === "next") setShowGoToField(false);
    else setShowGoToField(true);
  }

  return (
    <div className={styles["step-subcontainer"]}>
      <div>
        <label htmlFor={nameField}>Name</label>
        <input type="text" name={nameField} id={nameField} />
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
            {orderWorkflowUserRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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
      </div>
    </div>
  );
}
