"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowsWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";

type Props = {
  workflows: UnwrapPromise<ReturnType<typeof getWorkflowsWithIncludes>>;
};
export function ResultsTable({ workflows }: Props) {
  return (
    <GenericTable
      className={styles["basic-table"]}
      dataset={workflows}
      columns={[
        {
          headerName: "Name",
          createCell: (workflow) => (
            <Link href={`order-approval/workflows/${workflow.id}`}>
              {workflow.name}
            </Link>
          ),
        },
        {
          headerName: "Webstore",
          createCell: (workflow) => (
            <Link href={`order-approval/webstores/${workflow.webstore.id}`}>
              {workflow.webstore.name}
            </Link>
          ),
        },
        {
          headerName: "Active Instances",
          createCell: (workflow) =>
            workflow.instances.filter(
              (instance) => instance.status !== "finished"
            ).length,
        },
        {
          headerName: "Total Instances",
          createCell: (workflow) => (
            <>
              {workflow.instances.length}{" "}
              {workflow.instances.length > 0 && (
                <Link
                  href={`order-approval/workflows/${workflow.id}/instances`}
                >
                  (View)
                </Link>
              )}
            </>
          ),
        },
        {
          headerName: "Total Steps",
          createCell: (workflow) => workflow.steps.length,
        },
      ]}
    />
  );
}
