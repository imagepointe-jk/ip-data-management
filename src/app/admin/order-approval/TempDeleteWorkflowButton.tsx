"use client";

import { deleteWorkflowInstance } from "@/actions/orderWorkflow";

export function TempDeleteWorkflowButton({ id }: { id: number }) {
  return <button onClick={() => deleteWorkflowInstance(id)}>Delete</button>;
}
