import { ProductSyncRow } from "./generalProductUpload";
import styles from "@/styles/productImport/productImport.module.css";

type Props = {
  row: ProductSyncRow;
  expanded: boolean;
  onClick: (id: string) => void;
};
export function ProductUploadDisplay({ row, expanded, onClick }: Props) {
  const { data, error } = row;
  return (
    <div className={styles["item-container"]}>
      <div
        className={styles["expandable-headline"]}
        onClick={() => onClick(row.rowId)}
      >
        <div>
          {data?.sku || "UNKNOWN SKU"} (ID {data?.id || "UNKNOWN"})
          {data?.parentId !== undefined && (
            <span className={styles["variation-indicator"]}>
              variation of {data.parentId}
            </span>
          )}
        </div>
        {data !== undefined && (
          <div className={styles["status-indicator"]}>ready</div>
        )}
        {error !== undefined && (
          <div
            className={styles["status-indicator"]}
            style={{ backgroundColor: "red" }}
          >
            error, skipping
          </div>
        )}
      </div>
      {expanded && (
        <>
          {data && (
            <div className={styles["item-data-container"]}>
              <div>
                Published: <MaybeValue val={data.published} />
              </div>
              <div>
                Stock: <MaybeValue val={data.stock} />
              </div>
              <div>
                Order: <MaybeValue val={data.sortOrder} />
              </div>
              <div>Parent ID: {data.parentId || "(none)"}</div>
            </div>
          )}
          {error && (
            <div className={styles["error-message"]}>{error.message}</div>
          )}
        </>
      )}
    </div>
  );
}

function MaybeValue(props: { val: string | boolean | number | undefined }) {
  if (props.val === undefined) return "(unchanged)";
  return <span className={styles["highlighted"]}>{props.val}</span>;
}
