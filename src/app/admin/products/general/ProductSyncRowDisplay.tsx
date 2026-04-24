import { ProductSyncRow } from "./generalProductUpload";
import styles from "@/styles/productImport/productImport.module.css";

type Props = {
  row: ProductSyncRow;
};
export function ProductSyncRowDisplay({ row }: Props) {
  const { data, error } = row;
  return (
    <div className={styles["fake-table-data-row"]}>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-1"]}`}
      >
        {data?.id || "?"}
      </div>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-2"]}`}
      >
        {data?.sku || "?"}
      </div>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-3"]}`}
      >
        {data?.published || "?"}
      </div>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-4"]}`}
      >
        {data?.sortOrder || "?"}
      </div>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-5"]}`}
      >
        {data?.stock || "?"}
      </div>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-6"]}`}
      >
        {data?.parentId || "?"}
      </div>
      <div
        className={`${styles["fake-table-data-cell"]} ${styles["column-7"]}`}
      >
        ready
      </div>
    </div>
  );
}

function MaybeValue(props: { val: string | boolean | number | undefined }) {
  if (props.val === undefined) return "(unchanged)";
  return <span className={styles["highlighted"]}>{props.val}</span>;
}
