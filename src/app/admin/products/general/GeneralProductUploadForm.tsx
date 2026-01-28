"use client";

import { FormEvent, useState } from "react";
import {
  createPendingSyncRows,
  PendingSyncRow,
  syncRow,
  SyncRowResult,
} from "./generalProductUpload";

export function GeneralProductUploadForm() {
  const [pendingSyncRows, setPendingSyncRows] = useState<PendingSyncRow[]>([]);
  const [processedRows, setProcessedRows] = useState<SyncRowResult[]>([]);
  const nonErrorRows = pendingSyncRows.filter(
    (item) => item.error === undefined,
  );
  const submitButtonText =
    nonErrorRows.length > 0 ? "Import Now" : "Preview Import";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (pendingSyncRows.length === 0) {
      try {
        const rows = await createPendingSyncRows(formData);
        setPendingSyncRows(rows);
      } catch (error) {
        console.error(error);
      }
    } else if (nonErrorRows.length > 0) {
      const url = `${formData.get("url")}`;
      const key = `${formData.get("key")}`;
      const secret = `${formData.get("secret")}`;

      for (const row of nonErrorRows) {
        const result = await syncRow({ url, key, secret, row });
        setProcessedRows((prev) => [...prev, result]);
      }
    }
  }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "600px" }}
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
        <button type="submit">{submitButtonText}</button>
      </div>
      {processedRows.length === 0 && pendingSyncRows.length > 0 && (
        <div>
          {pendingSyncRows.length} pending sync rows.{" "}
          {pendingSyncRows.filter((item) => item.error !== undefined).length}{" "}
          error(s).
        </div>
      )}
      {processedRows.length > 0 && (
        <div>
          {processedRows.length < nonErrorRows.length && (
            <>
              {processedRows.length} of {nonErrorRows.length} rows processed...
            </>
          )}
          {processedRows.length === nonErrorRows.length && <>Sync complete.</>}
        </div>
      )}
      {processedRows.map((row) => (
        <div
          key={row.id}
          style={{
            color: !row.success ? "red" : undefined,
            fontWeight: !row.success ? "600" : undefined,
          }}
        >
          Result for product {row.sku} (ID {row.id}): {row.message}
        </div>
      ))}
    </form>
  );
}
