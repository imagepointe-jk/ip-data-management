"use client";

import { deleteWorkflowInstance } from "@/actions/orderWorkflow/delete";

export function TempDeleteWorkflowButton({ id }: { id: number }) {
  return <button onClick={() => deleteWorkflowInstance(id)}>Delete</button>;
}
