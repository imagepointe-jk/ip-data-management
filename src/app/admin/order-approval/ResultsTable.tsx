"use client";

import GenericTable from "@/components/GenericTable";
import styles from "@/styles/orderApproval/admin/main.module.css";
import Link from "next/link";

type Props = {
  workflows: {
    id: number;
    name: string;
    webstore: {
      id: number;
      name: string;
    };
    instances: {
      status: string;
    }[];
    steps: {}[];
  }[];
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
