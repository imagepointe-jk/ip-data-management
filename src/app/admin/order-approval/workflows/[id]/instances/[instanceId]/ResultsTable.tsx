"use client";

import GenericTable from "@/components/GenericTable";
import { getWorkflowInstanceWithIncludes } from "@/db/access/orderApproval";
import styles from "@/styles/orderApproval/orderApproval.module.css";
import Link from "next/link";
import { createApprovalFrontEndUrl } from "@/utility/url";
import { UnwrapPromise } from "@/types/schema/misc";

type Props = {
  instance: Exclude<
    UnwrapPromise<ReturnType<typeof getWorkflowInstanceWithIncludes>>,
    null
  >;
  webstoreUrl: string;
};
export function ResultsTable({ instance, webstoreUrl }: Props) {
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
              <Link href={createApprovalFrontEndUrl(webstoreUrl, code.guid)}>
                Front End Link
              </Link>
              )
            </>
          ),
        },
        {
          headerName: "PIN (this instance only)",
          createCell: (code) => code.simplePin,
        },
        // {
        //   headerName: "Role",
        //   createCell: (code) => code.userRole,
        // },
      ]}
      className={styles["basic-table"]}
    />
  );
}
