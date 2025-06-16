"use client";

import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { restartWorkflow } from "@/actions/orderWorkflow/misc";
import { deleteWorkflowInstance } from "@/actions/orderWorkflow/delete";
import { GenericTableExplorer } from "@/components/GenericTableExplorer/GenericTableExplorer";
import { OrderWorkflow, OrderWorkflowInstance } from "@prisma/client";
// import { useState } from "react";
import { InstanceRestartButton } from "./InstanceRestartButton";

type Props = {
  workflow: OrderWorkflow & { instances: OrderWorkflowInstance[] };
  pageSize: number;
  totalInstances: number;
};
export function ResultsExplorer({ workflow, pageSize, totalInstances }: Props) {
  const router = useRouter();
  const toast = useToast();
  // const [workflowsBeingRestarted, setWorkflowsBeingRestarted] = useState<number[]>([]); //ids of all workflow instances for which the "restart" button has been clicked and the "restart" action is still in a "loading" state

  // async function onClickRestart(id: number) {
  //   setWorkflowsBeingRestarted([...workflowsBeingRestarted, id]);
  //   try {
  //     await restartWorkflow(id);
  //     toast.toast("Workflow restarted.", "success");
  //     router.refresh();
  //   } catch (error) {
  //     console.error(error);
  //     toast.toast("Failed to restart workflow.", "error");
  //   }
  //   setWorkflowsBeingRestarted(workflowsBeingRestarted.filter(existingId => existingId !== id));
  // }

  async function onClickDelete(id: number) {
    if (!confirm("Are you sure you want to delete this workflow instance?"))
      return;

    try {
      await deleteWorkflowInstance(id);
      toast.toast("Instance deleted.", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.toast("Error deleting instance.", "error");
    }
  }

  return (
    <GenericTableExplorer
      dataset={workflow.instances}
      pageSize={pageSize}
      totalRecords={totalInstances}
      tableStyle={{ width: "100%" }}
      filteringProps={{
        hideSearch: true,
      }}
      columns={[
        {
          headerName: "ID",
          createCell: (instance) => (
            <Link href={`instances/${instance.id}`}>{instance.id}</Link>
          ),
        },
        {
          headerName: "Status",
          createCell: (instance) => instance.status,
        },
        {
          headerName: "WooCommerce Order ID",
          createCell: (instance) => instance.wooCommerceOrderId,
        },
        {
          headerName: "Current Step",
          createCell: (instance) => instance.currentStep,
        },
        {
          headerName: "Created On",
          createCell: (instance) => instance.createdAt.toLocaleString(),
        },
        {
          headerName: "Last Started On",
          createCell: (instance) => instance.lastStartedAt.toLocaleString(),
        },
        {
          headerName: "",
          createCell: (instance) => (
            <InstanceRestartButton id={instance.id} />
            //<button onClick={() => onClickRestart(instance.id)}>Restart</button>
          ),
        },
        {
          headerName: "",
          createCell: (instance) => (
            <button
              className="button-danger"
              onClick={() => onClickDelete(instance.id)}
            >
              DELETE
            </button>
          ),
        },
      ]}
    />
  );
}
