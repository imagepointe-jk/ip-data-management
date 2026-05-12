"use client";

import { FormEvent, useState } from "react";
import styles from "@/styles/leadImport/leadImport.module.css";
import { createLeadSyncRows, syncRow } from "./leadUpload";
import { LeadSyncRow } from "./types";
import { useImmer } from "use-immer";
import { LeadUploadRow } from "./LeadUploadRow";

//TODO: Because syncing/uploading from a spreadsheet is such a common need, this form should be genericized and reused as much as possible
export function LeadUploadForm() {
  const [leadSyncRows, setLeadSyncRows] = useImmer<LeadSyncRow[]>([]);
  const [processingIndex, setProcessingIndex] = useState(-1); //the index of leadSyncRows we're currently processing (-1 before processing starts)

  const errorRows = leadSyncRows.filter((item) => item.status === "error");
  const readyRows = leadSyncRows.filter((item) => item.status === "ready");
  const invalidRows = leadSyncRows.filter((item) => item.status === "invalid");
  const rowsParsed = leadSyncRows.length > 0;
  const submitButtonText = rowsParsed ? "Import Now" : "Preview Import";

  const idleState = leadSyncRows.length === 0;
  const readyState = processingIndex === -1;
  const uploadingState =
    processingIndex > -1 && processingIndex < leadSyncRows.length - 1;
  const doneState = processingIndex === leadSyncRows.length - 1;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!rowsParsed) {
      try {
        const rows = await createLeadSyncRows(formData);
        setLeadSyncRows(rows);
      } catch (error) {
        console.error(error);
      }
    } else {
      for (let i = 0; i < leadSyncRows.length; i++) {
        const row = leadSyncRows[i];
        setProcessingIndex(i);
        if (!row || row.status === "invalid") continue;

        try {
          updateExistingSyncRow(row.rowId, "processing");

          const result = await syncRow(row);

          if (result.success) {
            updateExistingSyncRow(row.rowId, "done");
          } else {
            updateExistingSyncRow(row.rowId, "error", result.message);
          }
        } catch (error) {
          updateExistingSyncRow(row.rowId, "error", `${error}`);
          continue;
        }
      }
    }
  }

  function updateExistingSyncRow(
    rowId: string,
    status: "ready" | "processing" | "error" | "done",
    message?: string,
  ) {
    setLeadSyncRows((prev) => {
      const prevRow = prev.find((item) => item.rowId === rowId);
      if (prevRow) {
        prevRow.status = status;
        prevRow.resultMessage = message ? message : undefined;
      }
    });
  }

  function clearForm() {
    const file = document.getElementById("file");

    (file as HTMLInputElement).value = "";

    setLeadSyncRows([]);
    setProcessingIndex(-1);
  }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "1400px" }}
      onSubmit={onSubmit}
    >
      <h3>Upload Import Spreadsheet</h3>
      <label htmlFor="file">
        <input type="file" name="file" id="file" required />
      </label>
      <div>
        <button type="submit">{submitButtonText}</button>
      </div>
      <div>
        <button type="button" onClick={clearForm}>
          Reset
        </button>
      </div>
      {!idleState && (
        <>
          <div className={styles["sync-status-bar"]}>
            {readyState && (
              <>
                {readyRows.length} of {leadSyncRows.length} rows ready for
                import.
              </>
            )}
            {uploadingState && (
              <>
                Processing row {processingIndex + 1} of {leadSyncRows.length}...
              </>
            )}
            {doneState && (
              <>
                Finished processing {leadSyncRows.length - invalidRows.length}{" "}
                of {leadSyncRows.length} row(s). {errorRows.length} total upload
                error(s). {invalidRows.length} row(s) skipped.
              </>
            )}
          </div>
        </>
      )}
      <div>
        <div className={styles["sync-table-container"]}>
          <table>
            <thead>
              <tr>
                <th>Contact ID</th>
                <th>Company ID</th>
                <th>Lead Name</th>
                <th>DA Lead</th>
                <th>Lead Type</th>
                <th>Owner ID</th>
                <th>Lead Stage</th>
                <th className={styles["column-lead-notes"]}>Note To Attach</th>
                <th className={styles["column-integration-notes"]}>
                  Int. Notes
                </th>
                <th className={styles["column-status"]}>Status</th>
                <th className={styles["column-message"]}>System Message</th>
              </tr>
            </thead>
            <tbody>
              {leadSyncRows.map((row) => (
                <LeadUploadRow key={row.rowId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
