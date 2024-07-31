"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";
import { restartWorkflow } from "@/actions/orderWorkflow";
import { useRouter } from "next/navigation";

type Props = {
  workflow: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
};
export function ResultsTable({ workflow }: Props) {
  const router = useRouter();

  async function onClickRestart(id: number) {
    await restartWorkflow(id);
    router.refresh();
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
          createCell: (instance) => (
            <>
              {instance.lastStartedAt.toLocaleString()}
              <button onClick={() => onClickRestart(instance.id)}>
                Restart
              </button>
            </>
          ),
        },
      ]}
    />
  );
}
