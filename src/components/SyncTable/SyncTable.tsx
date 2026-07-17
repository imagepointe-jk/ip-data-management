"use client";

import { CSSProperties, ReactNode } from "react";
import styles from "@/styles/SyncTable/syncTable.module.css";
import { LoadingIndicator } from "../LoadingIndicator";

export type SyncRowData = {
  rowId: string;
  status: "ready" | "processing" | "invalid" | "error" | "done";
  operation?: "create" | "update";
  resultMessage?: string;
};
type HasSyncRowData = {
  syncRowData: SyncRowData;
};
type GenericTableColumn<T> = {
  headerName: string;
  createCell: (data: T) => ReactNode;
  className?: string;
};
export type Props<T> = {
  dataset: T[];
  columns: GenericTableColumn<T>[];
  className?: string;
  style?: CSSProperties;
};
export default function SyncTable<T extends HasSyncRowData>({
  columns,
  dataset,
  className,
  style,
}: Props<T>) {
  const columnsToUse: GenericTableColumn<T>[] = [
    ...columns,
    {
      headerName: "Status",
      createCell: (data) => (
        <>
          {data.syncRowData.status === "done" && (
            <span className={styles["upload-done"]}>done</span>
          )}
          {data.syncRowData.status === "ready" && (
            <>{data.syncRowData.status}</>
          )}
          {data.syncRowData.status === "processing" && (
            <LoadingIndicator style={{ width: "15px", height: "15px" }} />
          )}
          {(data.syncRowData.status === "error" ||
            data.syncRowData.status === "invalid") && (
            <span className={styles["upload-error"]}>ERROR</span>
          )}
        </>
      ),
      className: styles["column-small"],
    },
    {
      headerName: "Operation",
      createCell: (data) => data.syncRowData.operation?.toLocaleUpperCase(),
      className: styles["column-small"],
    },
    {
      headerName: "System Message",
      createCell: (data) => data.syncRowData.resultMessage,
    },
  ];

  return (
    <div className={styles["sync-table-container"]}>
      <table className={className} style={style}>
        <thead>
          <tr>
            {columnsToUse.map((column, i) => (
              <th key={i} className={column.className}>
                {column.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.map((data) => (
            <tr key={data.syncRowData.rowId}>
              {columnsToUse.map((column, i) => (
                <td key={i}>{column.createCell(data)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
