"use client";

import { deleteStep } from "@/actions/orderWorkflow/delete";
import { getFullWorkflow } from "@/actions/orderWorkflow/misc";
import { updateWorkflow } from "@/actions/orderWorkflow/update";
import { useToast } from "@/components/ToastProvider";
import { WorkflowEditorData } from "@/types/dto/orderApproval";
import { deduplicateArray } from "@/utility/misc";
import { createContext, ReactNode, useContext, useState } from "react";
import { DraftFunction, useImmer } from "use-immer";

type EditingContextType = {
  workflowUsers: {
    id: number;
    name: string;
    email: string;
  }[];
  workflowState: WorkflowEditorData;
  selectedStepId: number | null;
  setSelectedStepId: (id: number | null) => void;
  updateWorkflowState: (
    arg: WorkflowEditorData | DraftFunction<WorkflowEditorData>
  ) => void;
  saveChanges: () => void;
  syncStateWithServer: () => Promise<void>;
  deleteStep: (id: number) => void;
  loading: boolean;
  syncedWithServer: boolean;
};
const EditingContext = createContext(null as null | EditingContextType);

export function useEditingContext() {
  const context = useContext(EditingContext);
  if (!context) throw new Error("No editing context");

  return context;
}

type Props = {
  children: ReactNode;
  workflow: WorkflowEditorData;
};
export function WorkflowEditingContextProvider({ children, workflow }: Props) {
  const [workflowState, setWorkflowState] = useImmer(workflow);
  const [loading, setLoading] = useState(false);
  const [syncedWithServer, setSyncedWithServer] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState<null | number>(null);
  const toast = useToast();
  const workflowUsers = deduplicateArray(
    workflowState.webstore.roles.flatMap((role) => role.users),
    (user) => `${user.id}`
  );

  //children are forced to use this wrapper for the default immer setstate function.
  //this way we can mark our state as "not synced with server" after normal state updates, but not after actually syncing with server.
  function updateWorkflowState(
    arg: WorkflowEditorData | DraftFunction<WorkflowEditorData>
  ) {
    setWorkflowState(arg);
    setSyncedWithServer(false);
  }

  async function saveChanges() {
    setLoading(true);
    await updateWorkflow(workflowState);
    toast.changesSaved();
    setSyncedWithServer(true);
    setLoading(false);
  }

  async function syncStateWithServer() {
    setLoading(true);
    const data = await getFullWorkflow(workflow.id);
    if (data) {
      setWorkflowState(data);
      setLoading(false);
      setSyncedWithServer(true);
    }
  }

  async function deleteStepFn(id: number) {
    setLoading(true);
    await deleteStep(id);
    await syncStateWithServer();
    toast.toast("Step deleted", "success");
  }

  return (
    <EditingContext.Provider
      value={{
        // workflowUsers: workflowState.webstore.userRoles.map((role) => ({
        //   ...role.user,
        //   role: role.role === "approver" ? "approver" : "purchaser",
        // })),
        workflowUsers,
        workflowState,
        updateWorkflowState,
        loading,
        syncedWithServer,
        selectedStepId,
        setSelectedStepId,
        saveChanges,
        syncStateWithServer,
        deleteStep: deleteStepFn,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
}
