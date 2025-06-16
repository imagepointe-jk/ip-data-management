import GenericTable, {
  HasId,
  Props as GenericTableProps,
} from "../GenericTable";
import { Props as FilteringProps } from "./Filtering";
import { PageNavigation } from "../PageNavigation/PageNavigation";
import { Filtering } from "./Filtering";
import { CSSProperties } from "react";

type Props = {
  pageSize: number;
  totalRecords: number;
  filteringProps?: FilteringProps;
  tableStyle?: CSSProperties;
};
//a wrapper for GenericTable that includes the table but also commonly needed tools for browsing any kind of data, like page numbers, search, etc.
export function GenericTableExplorer<T extends HasId>({
  dataset,
  columns,
  className,
  pageSize,
  totalRecords,
  filteringProps,
  tableStyle,
}: GenericTableProps<T> & Props) {
  return (
    <>
      <Filtering {...filteringProps} />
      <GenericTable
        dataset={dataset}
        columns={columns}
        className={className}
        style={tableStyle}
      />
      <PageNavigation totalPages={Math.ceil(totalRecords / pageSize)} />
    </>
  );
}
