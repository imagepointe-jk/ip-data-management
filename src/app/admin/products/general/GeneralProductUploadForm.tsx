"use client";

import SyncTable from "@/components/SyncTable/SyncTable";
import { FormEvent, useState } from "react";
import {
  createProductSyncRows,
  getServerContext,
  ProductSyncRow,
  syncRow,
} from "./generalProductUpload";
import { useImmer } from "use-immer";
import styles from "@/styles/productImport/productImport.module.css";

export function GeneralProductUploadForm() {
  const [syncRows, setSyncRows] = useImmer<ProductSyncRow[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    "ready" | "processing" | "done"
  >("ready");
  const syncRowsReady = syncRows.length > 0;
  const validRows = syncRows.filter(
    (item) => item.syncRowData.status !== "invalid",
  );
  const processedRows = syncRows.filter(
    (item) =>
      item.syncRowData.status === "done" || item.syncRowData.status === "error",
  );
  const errorRows = syncRows.filter(
    (item) => item.syncRowData.status === "error",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!syncRowsReady) {
      const rows = await createProductSyncRows(formData);
      setSyncRows(rows);
    } else {
      doSync(formData);
    }
  }

  async function doSync(formData: FormData) {
    const url = `${formData.get("url")}`;
    const key = `${formData.get("key")}`;
    const secret = `${formData.get("secret")}`;

    setUploadStatus("processing");
    const serverContext = await getServerContext({ url, key, secret });
    const sortedRows = syncRows.toSorted((a) =>
      a.data?.parentSku === undefined ? -1 : 1,
    );

    for (const row of sortedRows) {
      const { rowId, status } = row.syncRowData;
      if (status === "invalid" || status === "error") continue;

      try {
        updateExistingSyncRow(rowId, "processing");

        const result = await syncRow({
          url,
          key,
          secret,
          row,
          allRows: sortedRows,
          serverContext,
        });

        if (!result.success) {
          updateExistingSyncRow(rowId, "error", result.message);
        } else {
          updateExistingSyncRow(rowId, "done");
        }
      } catch (error) {
        updateExistingSyncRow(rowId, "error", "there was an error");
      }
    }

    setUploadStatus("done");
  }

  function updateExistingSyncRow(
    rowId: string,
    status: "ready" | "processing" | "error" | "done",
    message?: string,
  ) {
    setSyncRows((prev) => {
      const prevRow = prev.find((item) => item.syncRowData.rowId === rowId);
      if (prevRow) {
        prevRow.syncRowData.status = status;
        prevRow.syncRowData.resultMessage = message ? message : undefined;
      }
    });
  }

  function clearForm() {
    const url = document.getElementById("url");
    const key = document.getElementById("key");
    const secret = document.getElementById("secret");
    const file = document.getElementById("file");

    (url as HTMLInputElement).value = "";
    (key as HTMLInputElement).value = "";
    (secret as HTMLInputElement).value = "";
    (file as HTMLInputElement).value = "";

    setSyncRows([]);
    setUploadStatus("ready");
  }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "1400px" }}
      onSubmit={onSubmit}
    >
      <h3>Upload Import Spreadsheet</h3>
      <label htmlFor="url">
        Store URL
        <input type="text" name="url" id="url" required />
      </label>
      <label htmlFor="key">
        API Key
        <input type="text" name="key" id="key" required />
      </label>
      <label htmlFor="secret">
        API Secret
        <input type="text" name="secret" id="secret" required />
      </label>
      <label htmlFor="file">
        <input type="file" name="file" id="file" required />
      </label>
      <div>
        <button type="submit">
          {syncRowsReady ? "Upload" : "Preview Import"}
        </button>
      </div>
      <div>
        <button type="button" onClick={clearForm}>
          Reset
        </button>
      </div>
      {uploadStatus === "processing" && (
        <div>
          Processing row {processedRows.length} out of {validRows.length} valid
          rows. {errorRows.length} error(s) so far.
        </div>
      )}
      {uploadStatus === "done" && (
        <div>
          Processed {processedRows.length} out of {validRows.length} valid rows.{" "}
          {errorRows.length} error(s).
        </div>
      )}
      <SyncTable
        dataset={syncRows}
        style={{ width: "2250px" }}
        columns={[
          {
            createCell: (item) => item.data?.sku,
            headerName: "SKU",
            className: styles["column-medium"],
          },
          {
            createCell: (item) =>
              item.data?.published !== undefined
                ? `${item.data?.published}`
                : undefined,
            headerName: "Published",
            className: styles["column-small"],
          },
          {
            createCell: (item) => item.data?.name,
            headerName: "Name",
            className: styles["column-medium"],
          },
          {
            createCell: (item) => item.data?.description,
            headerName: "Description",
            className: styles["column-large"],
          },
          {
            createCell: (item) => item.data?.sortOrder,
            headerName: "Sort Order",
            className: styles["column-small"],
          },
          {
            createCell: (item) => item.data?.stock,
            headerName: "Stock",
            className: styles["column-small"],
          },
          {
            createCell: (item) => item.data?.lowStockAmount,
            headerName: "Low Stock Amount",
            className: styles["column-medium"],
          },
          {
            createCell: (item) => item.data?.weight,
            headerName: "Weight",
            className: styles["column-small"],
          },
          {
            createCell: (item) =>
              item.data?.manageStock !== undefined
                ? `${item.data?.manageStock}`
                : undefined,
            headerName: "Manage Stock?",
            className: styles["column-medium"],
          },
          {
            createCell: (item) =>
              item.data?.retailPrice !== undefined
                ? `$${item.data?.retailPrice?.toFixed(2)}`
                : undefined,
            headerName: "Retail Price",
            className: styles["column-small"],
          },
          {
            createCell: (item) =>
              item.data?.costOfGood !== undefined
                ? `$${item.data?.costOfGood?.toFixed(2)}`
                : undefined,
            headerName: "Cost of Good",
            className: styles["column-small"],
          },
          {
            createCell: (item) => item.data?.taxClass,
            headerName: "Tax Class",
            className: styles["column-small"],
          },
        ]}
      />
    </form>
  );
}
