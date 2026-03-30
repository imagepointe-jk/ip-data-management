"use client";

import { FormEvent, useState } from "react";
import {
  checkOrderValidationStatus,
  createPendingOrderUploads,
} from "./orderImport";
import { PendingOrderUploadDisplay } from "./PendingOrderUploadDisplay";
import { OrderImportDTO } from "@/types/schema/orders";

export function OrderImportForm() {
  const [pendingUploads, setPendingUploads] = useState<OrderImportDTO[]>([]);
  const [previewPressed, setPreviewPressed] = useState(false);
  const issueCount = pendingUploads.filter(
    (item) => checkOrderValidationStatus(item) === "missing",
  ).length;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const pendingOrderUploads = await createPendingOrderUploads(formData);
    setPendingUploads(pendingOrderUploads);

    setPreviewPressed(true);
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
        <input type="text" name="url" id="url" />
      </label>
      <label htmlFor="key">
        API Key
        <input type="text" name="key" id="key" />
      </label>
      <label htmlFor="secret">
        API Secret
        <input type="text" name="secret" id="secret" />
      </label>
      <label htmlFor="file">
        <input type="file" name="file" id="file" required />
      </label>
      {previewPressed && (
        <div>
          {pendingUploads.length} pending uploads. Initial checks found{" "}
          {issueCount} issue(s).
        </div>
      )}
      <div
        style={{
          border: "1px solid black",
          overflow: "auto",
          height: "400px",
          padding: "10px",
        }}
      >
        {pendingUploads.map((item) => (
          <PendingOrderUploadDisplay key={item.id} pendingUpload={item} />
        ))}
      </div>
      <div>
        <button type="submit">Preview Import</button>
      </div>
    </form>
  );
}
