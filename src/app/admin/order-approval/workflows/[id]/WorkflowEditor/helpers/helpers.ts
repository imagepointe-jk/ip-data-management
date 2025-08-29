import {
  OrderWorkflowStep,
  OrderWorkflowStepDisplay,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import { Line } from "../ConnectionLines";

type StepWithExtras = OrderWorkflowStep & {
  proceedListeners: OrderWorkflowStepProceedListener[];
  display: OrderWorkflowStepDisplay | null;
};
const lineOffset = {
  x: 90,
  y: 30,
};
function createLineBetweenSteps(
  step1: StepWithExtras,
  step2: StepWithExtras
): Line {
  const point1: { x: number; y: number } = step1.display
    ? {
        x: step1.display.positionX + lineOffset.x,
        y: step1.display.positionY + lineOffset.y,
      }
    : { x: 0, y: 0 };
  const point2: { x: number; y: number } = step2.display
    ? {
        x: step2.display.positionX + lineOffset.x,
        y: step2.display.positionY + lineOffset.y,
      }
    : { x: 0, y: 0 };

  return {
    point1,
    point2,
  };
}

function resolveStepFromGoToValue(
  originStep: StepWithExtras,
  value: string,
  allSteps: StepWithExtras[]
) {
  if (value === "next") {
    return allSteps.find(
      (otherStep) => +otherStep.order === originStep.order + 1
    );
  }

  return allSteps.find((otherStep) => +otherStep.order === +value);
}

function resolveNextSteps(step: StepWithExtras, allSteps: StepWithExtras[]) {
  const proceedTo = step.proceedImmediatelyTo;
  const result: StepWithExtras[] = [];
  if (proceedTo === null) {
    for (const listener of step.proceedListeners) {
      const nextStep = resolveStepFromGoToValue(step, listener.goto, allSteps);
      if (nextStep) result.push(nextStep);
    }
    return result;
  }

  const nextStep = resolveStepFromGoToValue(step, proceedTo, allSteps);
  if (nextStep) result.push(nextStep);

  return result;
}

export function createConnectionLines(steps: StepWithExtras[]): Line[] {
  const lines: Line[] = [];

  for (const step of steps) {
    const nextSteps = resolveNextSteps(step, steps);
    for (const nextStep of nextSteps) {
      lines.push(createLineBetweenSteps(step, nextStep));
    }
  }

  return lines;
}
