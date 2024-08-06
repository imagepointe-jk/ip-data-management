"use client";
import styles from "@/styles/orderApproval/workflowPreview.module.css";
import { faArrowDown, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

type StepPreview = {
  id: number;
  name: string;
  order: number;
  proceedImmediatelyTo: string | null;
  proceedListeners: { id: number; from: string; type: string; goto: string }[];
};
type Props = {
  steps: StepPreview[];
};
export function WorkflowPreview({ steps }: Props) {
  const [choices, setChoices] = useState<SimulationChoice[]>([]);
  const sorted = [...steps];
  sorted.sort((a, b) => a.order - b.order);

  const { error, simulatedSteps } = simulateSteps(steps, choices);

  function onClickSimulationChoice(
    simulationIndex: number,
    choiceIndex: number
  ) {
    const newChoices = [...choices];
    //find the index of the existing choice for whatever index of the simulation was clicked
    const indexOfExistingChoice = newChoices.findIndex(
      (choice) => choice.simulationIndex === simulationIndex
    );
    const existingChoice = newChoices[indexOfExistingChoice];
    //if it's found, replace it with a new updated object
    if (existingChoice)
      newChoices[indexOfExistingChoice] = {
        choiceIndex,
        simulationIndex: existingChoice.simulationIndex,
      };
    //if it's not found, create a new one
    else newChoices.push({ choiceIndex, simulationIndex });

    setChoices(newChoices);
  }

  return (
    <div className={styles["main"]}>
      {error && (
        <div className={styles["error-container"]}>
          {error.message} (At Step: {error.atStepNumber || "N/A"})
        </div>
      )}
      Workflow Preview
      <div className={styles["preview-area"]}>
        {simulatedSteps.map((step, simulationIndex, array) => (
          <div
            className={styles["step"]}
            key={`step-${step.id}-simulation-index-${simulationIndex}`}
          >
            <div className={styles["step-name"]}>
              #{step.order} - {step.name}
            </div>
            <div className={styles["step-id"]}>id: {step.id}</div>
            {step.proceedImmediatelyTo === null && (
              // Simulation choices
              <div>
                Simulate Event
                <div className={styles["step-listeners-container"]}>
                  {step.proceedListeners.length === 0 && "No event listeners"}
                  {step.proceedListeners.map((listener, listenerIndex) => (
                    <label
                      key={listener.id}
                      htmlFor={`listener-${listener.id}-simulation-index-${simulationIndex}`}
                      className={styles["step-listener"]}
                    >
                      <input
                        id={`listener-${listener.id}-simulation-index-${simulationIndex}`}
                        name={`step-${step.id}-choice`}
                        type="radio"
                        value={listenerIndex}
                        defaultChecked={
                          choices.find(
                            (choice) =>
                              choice.simulationIndex === simulationIndex &&
                              choice.choiceIndex === listenerIndex
                          )
                            ? true
                            : listenerIndex === 0
                        }
                        onChange={(e) =>
                          onClickSimulationChoice(
                            simulationIndex,
                            +e.target.value
                          )
                        }
                      />
                      {listener.from}: {listener.type}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {simulationIndex < array.length - 1 && (
              <div className={styles["next-step-arrow"]}>
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles["info"]}>
        <FontAwesomeIcon icon={faInfoCircle} /> Preview not updating? Try
        clicking &quot;Save Changes&quot; first.
      </div>
    </div>
  );
}

type SimulationError = {
  message: string;
  atStepNumber?: number;
};
type SimulationChoice = {
  simulationIndex: number;
  choiceIndex: number;
};
function simulateSteps(
  allSteps: StepPreview[],
  simulationChoices: SimulationChoice[] //for each step that has event listeners, which event listener the user chose to preview
) {
  const result: { simulatedSteps: StepPreview[]; error?: SimulationError } = {
    simulatedSteps: [],
  };
  const limit = 50; //assume that if a workflow simulation gets this long, it's circular
  let prevTargetStepNumber = -1;
  let targetStepNumber = 0;

  for (let simulationIndex = 0; simulationIndex < limit; simulationIndex++) {
    //First try to find the intended current step using targetStepNumber
    const step = allSteps.find((step) => step.order === targetStepNumber);

    if (!step) {
      result.error = {
        message: `Step ${prevTargetStepNumber} tried to proceed to step ${targetStepNumber}, but that step was not found.`,
        atStepNumber: prevTargetStepNumber,
      };
      break;
    }

    //if it's found, add it to the simulation result
    result.simulatedSteps.push(step);

    //if the current step proceeds immediately to another step, set the new targetStepNumber
    if (step.proceedImmediatelyTo !== null) {
      prevTargetStepNumber = targetStepNumber;
      if (step.proceedImmediatelyTo === "next") {
        targetStepNumber++;
      } else {
        targetStepNumber = +step.proceedImmediatelyTo;
      }
    }

    //if the current step waits for an event AND it actually has some listeners,
    //set the new targetStepNumber based on which event the user chose to simulate at this point in the simulation.
    //if they haven't made a choice for this point in the simulation, default to the first choice.
    else if (step.proceedListeners.length > 0) {
      const choiceThisStep = simulationChoices.find(
        (choice) => choice.simulationIndex === simulationIndex
      ) || { choiceIndex: 0, simulationIndex };

      const simulatedListener =
        step.proceedListeners[choiceThisStep.choiceIndex];
      if (!simulatedListener) {
        result.error = {
          message: `Failed to simulate choice ${choiceThisStep.choiceIndex} for step ${step.order} (id ${step.id}). This is a bug.`,
          atStepNumber: targetStepNumber,
        };
        break;
      }

      prevTargetStepNumber = targetStepNumber;
      targetStepNumber =
        simulatedListener.goto === "next"
          ? targetStepNumber + 1
          : +simulatedListener.goto;
    }

    //if the current step waits for an event AND has no listeners, we can't go any further.
    else break;
  }

  if (result.simulatedSteps.length >= limit) {
    result.error = {
      message:
        "The preview generated a very long sequence. Please check the workflow for circularity.",
    };
  }

  return result;
}
