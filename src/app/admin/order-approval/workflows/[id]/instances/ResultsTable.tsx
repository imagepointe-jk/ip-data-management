"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { UnwrapPromise } from "@/types/schema/misc";
import { restartWorkflow } from "@/actions/orderWorkflow/misc";
import { deleteWorkflowInstance } from "@/actions/orderWorkflow/delete";

type Props = {
  workflow: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
};
export function ResultsTable({ workflow }: Props) {
  const router = useRouter();
  const toast = useToast();

  async function onClickRestart(id: number) {
    await restartWorkflow(id);
    toast.toast("Workflow restarted.", "success");
    router.refresh();
  }

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
    <GenericTable
      className={styles["basic-table"]}
      dataset={workflow.instances}
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
            <button onClick={() => onClickRestart(instance.id)}>Restart</button>
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
