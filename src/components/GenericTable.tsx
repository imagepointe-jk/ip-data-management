"use client";
import { ReactNode } from "react";

type HasId = {
  id: number;
};
type GenericTableColumn<T> = {
  header: string;
  createCell: (data: T) => ReactNode;
};
type Props<T> = {
  dataset: T[];
  columns: GenericTableColumn<T>[];
};
export default function GenericTable<T extends HasId>({
  columns,
  dataset,
}: Props<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i}>{column.header}</th>
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
