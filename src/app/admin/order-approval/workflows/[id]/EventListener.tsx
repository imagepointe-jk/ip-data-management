"use client";

import { deleteEventListener } from "@/actions/orderWorkflow/delete";
import {
  orderWorkflowEventTypes,
  OrderWorkflowUserRole,
} from "@/types/schema/orderApproval";
import {
  OrderWorkflowStepProceedListener,
  OrderWorkflowUser,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

type EventListenerProps = {
  listener: OrderWorkflowStepProceedListener;
  workflowUsers: (OrderWorkflowUser & { role: OrderWorkflowUserRole })[];
};
export function EventListener({ listener, workflowUsers }: EventListenerProps) {
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
    <div className="content-frame-minor vert-flex-group">
      <div>
        <label htmlFor={nameField} className="input-label">
          Name
        </label>
        <input
          type="text"
          name={nameField}
          id={nameField}
          defaultValue={listener.name}
        />
      </div>
      <div>
        <label className="input-label">
          When the following event type is received...
        </label>
        <select name={typeField} id={typeField} defaultValue={listener.type}>
          {orderWorkflowEventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>{" "}
      </div>
      <div>
        <label className="input-label">...from the following person...</label>
        <select name={fromField} id={fromField} defaultValue={listener.from}>
          {[
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
        </select>{" "}
      </div>
      <div>
        <label className="input-label">...go to...</label>
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
      <div>
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
