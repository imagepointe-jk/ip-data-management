import { orderWorkflowActionTypes } from "@/types/schema/orderApproval";
import { makeStringTitleCase } from "@/utility/misc";
import { OrderWorkflowStep } from "@prisma/client";
import { useEditingContext } from "../WorkflowEditingContext";
import { useState } from "react";

type Props = {
  step: OrderWorkflowStep;
};
export function StepActionSettings({ step }: Props) {
  const { workflowUsers, updateWorkflowState } = useEditingContext();

  function onChangeActionType(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.actionType = value;
    });
  }

  function onChangeActionTarget(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.actionTarget = value === "none" ? null : value;
    });
  }
  function onChangeOtherActionTargets(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.otherActionTargets = value;
    });
  }
  function onChangeActionSubject(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.actionSubject = value;
    });
  }
  function onChangeActionMessage(value: string) {
    updateWorkflowState((draft) => {
      const draftStep = draft.steps.find(
        (draftStep) => draftStep.id === step.id
      );
      if (draftStep) draftStep.actionMessage = value;
    });
  }

  return (
    <div>
      <div className="input-label">Action Settings</div>
      <div className="input-group content-frame-minor">
        <div>
          {/* Action Type */}

          <div className="input-label">Action Type</div>
          <select
            value={step.actionType}
            onChange={(e) => onChangeActionType(e.target.value)}
          >
            {orderWorkflowActionTypes.map((type) => (
              <option key={type} value={type}>
                {makeStringTitleCase(type)}
              </option>
            ))}
          </select>
        </div>

        {step.actionType === "email" && (
          <>
            {/* Action Target */}

            <div style={{ display: "flex" }}>
              <div>
                <div className="input-label">Action Target</div>
                <input
                  type="text"
                  value={step.actionTarget || ""}
                  onChange={(e) => onChangeActionTarget(e.target.value)}
                />
              </div>
              <div>
                <div className="input-label">Quick Select</div>
                <select
                  value=""
                  onChange={(e) => onChangeActionTarget(e.target.value)}
                >
                  {[
                    <option key={-1} value="">
                      Select...
                    </option>,
                    ...workflowUsers.map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.name}
                      </option>
                    )),
                    <option key="purchaser" value="purchaser">
                      Purchaser
                    </option>,
                    <option key="approver" value="approver">
                      Approver
                    </option>,
                  ]}
                </select>
              </div>
            </div>

            {/* Other action targets */}

            <div>
              <div className="input-label">
                Other Action Targets (separate with {";"})
              </div>
              <input
                type="text"
                value={step.otherActionTargets || ""}
                onChange={(e) => onChangeOtherActionTargets(e.target.value)}
                style={{ width: "500px" }}
              />
            </div>

            {/* Action Subject */}

            <div>
              <div className="input-label">Action Subject</div>
              <input
                type="text"
                value={step.actionSubject || ""}
                onChange={(e) => onChangeActionSubject(e.target.value)}
              />
            </div>

            {/* Action Message */}

            <div>
              <label className="input-label">Action Message</label>
              <textarea
                value={step.actionMessage || ""}
                onChange={(e) => onChangeActionMessage(e.target.value)}
                cols={60}
                rows={10}
              ></textarea>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
