"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowInstanceWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";

type Props = {
  instance: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowInstanceWithIncludes>>,
    null
  >;
};
export function ResultsTable({ instance }: Props) {
  const withIds = instance.accessCodes.map((code) => ({
    ...code,
    id: code.guid,
  }));
  return (
    <GenericTable
      dataset={withIds}
      columns={[
        {
          headerName: "Name",
          createCell: (code) => code.user.name,
        },
        {
          headerName: "Access Code",
          createCell: (code) => (
            <>
              {`${code.guid} `}(
              <Link href={`/order-approval/${code.guid}`}>Front End Link</Link>)
            </>
          ),
        },
        {
          headerName: "Role",
          createCell: (code) => code.userRole,
        },
      ]}
      className={styles["basic-table"]}
    />
  );
}
