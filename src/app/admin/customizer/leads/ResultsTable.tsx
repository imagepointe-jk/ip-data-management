"use client";

import GenericTable from "@/components/GenericTable";
import { CustomProductRequest } from "@prisma/client";
import styles from "@/styles/customizer/LeadsResultsTable.module.css";
import Link from "next/link";

type Props = {
  requests: CustomProductRequest[];
};
export default function ResultsTable({ requests }: Props) {
  return (
    <GenericTable
      className={styles["table"]}
      dataset={requests}
      columns={[
        {
          headerName: "ID",
          createCell: (data) => data.id,
        },
        {
          headerName: "First Name",
          createCell: (data) => data.firstName,
        },
        {
          headerName: "Last Name",
          createCell: (data) => data.lastName,
        },
        {
          headerName: "Email",
          createCell: (data) => data.email,
        },
        {
          headerName: "Union/Organization",
          createCell: (data) => data.company,
        },
        {
          headerName: "Local",
          createCell: (data) => data.local || "(None given)",
        },
        {
          headerName: "Received",
          createCell: (data) => data.createdAt.toLocaleString(),
        },
        {
          headerName: "",
          createCell: (data) => (
            <Link href={`/admin/customizer/leads/${data.id}`}>View</Link>
          ),
        },
      ]}
    />
  );
}
