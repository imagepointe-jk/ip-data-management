import { LoadingIndicator } from "@/components/LoadingIndicator";
import { LeadSyncRow } from "./types";
import styles from "@/styles/leadImport/leadImport.module.css";

type Props = {
  row: LeadSyncRow;
};
export function LeadUploadRow({ row }: Props) {
  return (
    <tr>
      <td>{row.data?.contactId || ""}</td>
      <td>{row.data?.companyId || ""}</td>
      <td>{row.data?.name || ""}</td>
      <td>{row.data?.daLead !== undefined ? `${row.data.daLead}` : ""}</td>
      <td>{row.data?.leadType || ""}</td>
      <td>{row.data?.ownerId || ""}</td>
      <td>{row.data?.stage || ""}</td>
      <td>{row.data?.noteBody || ""}</td>
      <td>{row.data?.integrationActivityNotes || ""}</td>
      <td>
        {row.status === "done" && (
          <span className={styles["upload-done"]}>done</span>
        )}
        {row.status === "ready" && <>{row.status}</>}
        {row.status === "processing" && (
          <LoadingIndicator style={{ width: "15px", height: "15px" }} />
        )}
        {(row.status === "error" || row.status === "invalid") && (
          <span className={styles["upload-error"]}>ERROR</span>
        )}
      </td>
      <td>{row.resultMessage || ""}</td>
    </tr>
  );
}
