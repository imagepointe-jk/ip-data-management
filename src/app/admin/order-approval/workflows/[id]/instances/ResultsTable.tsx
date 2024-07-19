"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import styles from "@/styles/orderApproval/orderApproval.module.css";

type Props = {
  workflow: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowWithIncludes>>,
    null
  >;
};
export function ResultsTable({ workflow }: Props) {
  return (
    <GenericTable
      className={styles["basic-table"]}
      dataset={workflow.instances}
      columns={[
        {
          headerName: "ID",
          createCell: (instance) => instance.id,
        },
        {
          headerName: "Status",
          createCell: (instance) => instance.status,
        },
        {
          headerName: "WooCommerce Order ID",
          createCell: (instance) => instance.id,
        },
        {
          headerName: "Current Step",
          createCell: (instance) => instance.currentStep,
        },
      ]}
    />
  );
}
