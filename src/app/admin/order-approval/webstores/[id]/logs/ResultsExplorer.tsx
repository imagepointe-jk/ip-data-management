"use client";

import { GenericTableExplorer } from "@/components/GenericTableExplorer/GenericTableExplorer";
import { WebstoreLog } from "@prisma/client";
import styles from "@/styles/logs/logs.module.css";
import { PAGE_SIZE } from "./page";

type Props = {
  logs: WebstoreLog[];
  totalLogs: number;
};
export function ResultsExplorer({ logs, totalLogs }: Props) {
  return (
    <GenericTableExplorer
      pageSize={PAGE_SIZE}
      totalRecords={totalLogs}
      dataset={logs}
      className={styles["basic-table"]}
      filteringProps={{
        dropdowns: [
          {
            label: "Severity",
            paramName: "severity",
            options: [
              {
                displayName: "Info",
                value: "info",
              },
              {
                displayName: "Warning",
                value: "warning",
              },
              {
                displayName: "Error",
                value: "error",
              },
            ],
          },
          {
            label: "Sort Direction",
            paramName: "sortDirection",
            hideEmptyOption: true,
            options: [
              {
                displayName: "Descending",
                value: "desc",
              },
              {
                displayName: "Ascending",
                value: "asc",
              },
            ],
          },
        ],
      }}
      columns={[
        {
          headerName: "Message",
          createCell: (data) => (
            <div className={styles["message-column"]}>{data.text}</div>
          ),
        },
        {
          headerName: "Severity",
          createCell: (data) => data.severity,
        },
        {
          headerName: "Event",
          createCell: (data) => data.event,
        },
        {
          headerName: "Date",
          createCell: (data) => data.createdAt.toLocaleString(),
        },
      ]}
    />
  );
}
