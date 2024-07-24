"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";

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
          createCell: (instance) => instance.id,
        },
        {
          headerName: "Current Step",
          createCell: (instance) => instance.currentStep,
        },
        {
          headerName: "Started On",
          createCell: (instance) => instance.createdAt.toLocaleString(),
        },
      ]}
    />
  );
}
