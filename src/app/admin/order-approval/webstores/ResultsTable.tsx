"use client";

import GenericTable from "@/components/GenericTable";
import { getWebstoresWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import styles from "@/styles/orderApproval/orderApproval.module.css";

type Props = {
  webstores: UnwrapPromise<ReturnType<typeof getWebstoresWithIncludes>>;
};
export function ResultsTable({ webstores }: Props) {
  return (
    <GenericTable
      dataset={webstores}
      columns={[
        {
          headerName: "Name",
          createCell: (webstore) => webstore.name,
        },
        {
          headerName: "URL",
          createCell: (webstore) => <a href={webstore.url}>{webstore.url}</a>,
        },
        {
          headerName: "Organization Name",
          createCell: (webstore) => webstore.organizationName,
        },
        {
          headerName: "Active Workflows",
          createCell: (webstore) =>
            webstore.workflows.reduce(
              (accum, item) =>
                accum +
                item.instances.filter(
                  (instance) => instance.status !== "finished"
                ).length,
              0
            ),
        },
        {
          headerName: "Total Workflows",
          createCell: (webstore) =>
            webstore.workflows.reduce(
              (accum, item) => accum + item.instances.length,
              0
            ),
        },
      ]}
      className={styles["basic-table"]}
    />
  );
}
