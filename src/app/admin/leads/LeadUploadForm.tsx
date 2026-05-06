"use client";

import { FormEvent, useState } from "react";
import styles from "@/styles/leadImport/leadImport.module.css";

export function LeadUploadForm() {
  //   const [productSyncRows, setProductSyncRows] = useState<ProductSyncRow[]>([]);
  //   const [processedRows, setProcessedRows] = useState<ProductSyncRowResult[]>(
  //     [],
  //   );
  //   const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  //   const nonErrorRows = productSyncRows.filter(
  //     (item) => item.error === undefined,
  //   );
  //   const submitButtonText =
  //     nonErrorRows.length > 0 ? "Import Now" : "Preview Import";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // const form = e.target as HTMLFormElement;
    // const formData = new FormData(form);

    // if (productSyncRows.length === 0) {
    //   try {
    //     const rows = await createProductSyncRows(formData);
    //     setProductSyncRows(rows);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // } else if (nonErrorRows.length > 0) {
    //   const url = `${formData.get("url")}`;
    //   const key = `${formData.get("key")}`;
    //   const secret = `${formData.get("secret")}`;

    //   for (const row of nonErrorRows) {
    //     const result = await syncRow({ url, key, secret, row });
    //     setProcessedRows((prev) => [...prev, result]);
    //   }
    // }
  }

  //   function clearForm() {
  //     const url = document.getElementById("url");
  //     const key = document.getElementById("key");
  //     const secret = document.getElementById("secret");
  //     const file = document.getElementById("file");

  //     (url as HTMLInputElement).value = "";
  //     (key as HTMLInputElement).value = "";
  //     (secret as HTMLInputElement).value = "";
  //     (file as HTMLInputElement).value = "";

  //     setProductSyncRows([]);
  //     setProcessedRows([]);
  //   }

  //   function onClickRowHeadline(id: string) {
  //     setExpandedRowIds((prev) => {
  //       if (prev.includes(id)) {
  //         return prev.filter((existingId) => existingId !== id);
  //       }

  //       return [...prev, id];
  //     });
  //   }

  //   function setAllExpandedStates(expanded: boolean) {
  //     setExpandedRowIds(expanded ? productSyncRows.map((row) => row.rowId) : []);
  //   }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "900px" }}
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
        <button type="submit">Preview Import</button>
      </div>
      <div>
        <button type="button" onClick={() => {}}>
          Reset
        </button>
      </div>
      <div className={styles["sync-status-bar"]}>
        <div>lorem ipsum dolor sit amet</div>
        {/* <div className={styles["expand-buttons-container"]}>
          <button onClick={() => setAllExpandedStates(true)} type="button">
            expand all
          </button>
          <button onClick={() => setAllExpandedStates(false)} type="button">
            collapse all
          </button>
        </div> */}
      </div>
      <div>
        <div className={styles["sync-table-container"]}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Published</th>
                <th>Stock</th>
                <th>Order</th>
                <th>Parent ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
              <tr>
                <td>1234</td>
                <td>AS1234</td>
                <td>true</td>
                <td>1234</td>
                <td>1234</td>
                <td>1234</td>
                <td>ready</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
