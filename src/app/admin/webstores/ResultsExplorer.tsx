"use client";

import { GenericTableExplorer } from "@/components/GenericTableExplorer/GenericTableExplorer";
import Link from "next/link";
import styles from "@/styles/webstores/WebstoresResultsTable.module.css";

type Props = {
  webstores: {
    id: number;
    name: string;
    url: string;
    organizationName: string;
  }[];
  totalRecords: number;
  pageSize: number;
};
export function ResultsExplorer({ webstores, totalRecords, pageSize }: Props) {
  return (
    <GenericTableExplorer
      dataset={webstores}
      pageSize={pageSize}
      totalRecords={totalRecords}
      className={styles["table"]}
      columns={[
        {
          headerName: "ID",
          createCell: (data) => data.id,
        },
        {
          headerName: "Name",
          createCell: (data) => (
            <Link href={`webstores/${data.id}`}>{data.name}</Link>
          ),
        },
        {
          headerName: "URL",
          createCell: (data) => data.url,
        },
        {
          headerName: "Organization Name",
          createCell: (data) => data.organizationName,
        },
      ]}
    />
  );
}
