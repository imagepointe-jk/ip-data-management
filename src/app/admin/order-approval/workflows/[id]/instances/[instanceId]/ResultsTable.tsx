"use client";

import GenericTable from "@/components/GenericTable";
import styles from "@/styles/orderApproval/admin/main.module.css";
import Link from "next/link";
import { createApprovalFrontEndUrl } from "@/utility/url";

type Props = {
  instance: {
    id: number;
    accessCodes: {
      guid: string;
      user: {
        name: string;
      };
      simplePin: string;
    }[];
  };
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
      ]}
      className={styles["basic-table"]}
    />
  );
}
