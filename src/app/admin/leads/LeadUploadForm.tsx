"use client";

import { FormEvent, useState } from "react";
import styles from "@/styles/leadImport/leadImport.module.css";
import { createLeadSyncRows, syncRow } from "./leadUpload";
import { LeadSyncRow } from "./types";

//TODO: Because syncing/uploading from a spreadsheet is such a common need, this form should be genericized and reused as much as possible
export function LeadUploadForm() {
  const [leadSyncRows, setLeadSyncRows] = useState<LeadSyncRow[]>([]);
  const nonErrorRows = leadSyncRows.filter((item) => item.error === undefined);
  const parsedDataReady = leadSyncRows.length > 0;
  const anyGoodRows = nonErrorRows.length > 0;
  const submitButtonText = anyGoodRows ? "Import Now" : "Preview Import";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!parsedDataReady) {
      try {
        const rows = await createLeadSyncRows(formData);
        setLeadSyncRows(rows);
      } catch (error) {
        console.error(error);
      }
    } else if (anyGoodRows) {
      for (const row of nonErrorRows) {
        try {
          const result = await syncRow(row);
          console.log(result.message);
          console.log("done");
        } catch (error) {
          continue;
        }
      }
    }
  }

  function clearForm() {
    const file = document.getElementById("file");

    (file as HTMLInputElement).value = "";

    setLeadSyncRows([]);
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
      <div className={styles["sync-status-bar"]}>
        <div>lorem ipsum dolor sit amet</div>
      </div>
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
                <th>Status</th>
                <th>System Message</th>
              </tr>
            </thead>
            <tbody>
              {leadSyncRows.map((row) => (
                <tr key={row.rowId}>
                  <td>{row.data?.contactId || ""}</td>
                  <td>{row.data?.companyId || ""}</td>
                  <td>{row.data?.name || ""}</td>
                  <td>
                    {row.data?.daLead !== undefined ? `${row.data.daLead}` : ""}
                  </td>
                  <td>{row.data?.leadType || ""}</td>
                  <td>{row.data?.ownerId || ""}</td>
                  <td>{row.data?.stage || ""}</td>
                  <td>{row.data?.noteBody || ""}</td>
                  <td>{row.data?.integrationActivityNotes || ""}</td>
                  <td>{row.error ? "ERROR" : "ready"}</td>
                  <td>{row.error?.message || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
