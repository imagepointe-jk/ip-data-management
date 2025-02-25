"use client";

import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/schema/misc";
import { OrderWorkflowUserRole } from "@/types/schema/orderApproval";
import { OrderWorkflowUser } from "@prisma/client";
import { createContext, ReactNode, useContext } from "react";
import { Updater, useImmer } from "use-immer";

type EditingContextType = {
  workflowUsers: (OrderWorkflowUser & { role: OrderWorkflowUserRole })[];
  workflowState: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
  setWorkflowState: Updater<
    Exclude<UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>, null>
  >;
};
const EditingContext = createContext(null as null | EditingContextType);

export function useEditingContext() {
  const context = useContext(EditingContext);
  if (!context) throw new Error("No editing context");

  return context;
}

type Props = {
  children: ReactNode;
  workflow: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
};
export function WorkflowEditingContextProvider({ children, workflow }: Props) {
  const [workflowState, setWorkflowState] = useImmer(workflow);
  return (
    <EditingContext.Provider
      value={{
        workflowUsers: workflowState.webstore.userRoles.map((role) => ({
          ...role.user,
          role: role.role === "approver" ? "approver" : "purchaser",
        })),
        workflowState,
        setWorkflowState,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
}
