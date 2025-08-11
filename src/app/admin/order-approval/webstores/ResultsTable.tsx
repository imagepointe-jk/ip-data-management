"use client";

import GenericTable from "@/components/GenericTable";
import { getWebstoresWithIncludes } from "@/db/access/orderApproval";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import { UnwrapPromise } from "@/types/schema/misc";
import { deduplicateArray } from "@/utility/misc";
import Link from "next/link";

type Props = {
  webstores: UnwrapPromise<ReturnType<typeof getWebstoresWithIncludes>>;
};
export function ResultsTable({ webstores }: Props) {
  return (
    <GenericTable
      dataset={webstores}
      columns={[
        {
          headerName: "ID",
          createCell: (webstore) => webstore.id,
        },
        {
          headerName: "Name",
          createCell: (webstore) => (
            <Link href={`webstores/${webstore.id}`}>{webstore.name}</Link>
          ),
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
        {
          headerName: "Associated Users",
          createCell: (webstore) => {
            const deduplicatedUsers = deduplicateArray(
              webstore.roles.flatMap((role) => role.users),
              (user) => `${user.id}`
            );
            return (
              <>
                {deduplicatedUsers.length}{" "}
                <Link href={`webstores/${webstore.id}/users`}>(View)</Link>
              </>
            );
          },
        },
      ]}
      className={styles["basic-table"]}
    />
  );
}
