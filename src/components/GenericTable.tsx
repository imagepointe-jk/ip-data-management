"use client";
import { ReactNode } from "react";

type HasId = {
  id: number | string;
};
type GenericTableColumn<T> = {
  headerName: string;
  createHeader?: () => ReactNode;
  createCell: (data: T) => ReactNode;
  className?: string;
};
type Props<T> = {
  dataset: T[];
  columns: GenericTableColumn<T>[];
  className?: string;
};
export default function GenericTable<T extends HasId>({
  columns,
  dataset,
  className,
}: Props<T>) {
  return (
    <table className={className}>
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i} className={column.className}>
              {column.createHeader ? column.createHeader() : column.headerName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataset.map((data) => (
          <tr key={data.id}>
            {columns.map((column, i) => (
              <td key={i}>{column.createCell(data)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
