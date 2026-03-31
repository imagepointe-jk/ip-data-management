"use client";

import { FormEvent, useState } from "react";
import { PendingOrderUploadDisplay } from "./PendingOrderUploadDisplay";
import {
  createPendingOrderUploadData,
  PendingOrderUploadData,
} from "./orderImport";

export function OrderImportForm() {
  const [pendingUploadData, setPendingUploadData] =
    useState<PendingOrderUploadData>();
  const [previewStatus, setPreviewStatus] = useState<
    "idle" | "loading" | "done"
  >("idle");
  const [previewError, setPreviewError] = useState("");
  const issueCount = pendingUploadData?.validationStatuses.filter(
    (item) => item.overallStatus !== "ok",
  ).length;

  async function createImportPreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setPreviewStatus("loading");
    try {
      const pendingData = await createPendingOrderUploadData(formData);
      setPendingUploadData(pendingData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      setPreviewError(message);
    }

    setPreviewStatus("done");
  }

  async function uploadData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
  }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "600px" }}
      onSubmit={previewStatus === "idle" ? createImportPreview : uploadData}
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
      {previewStatus === "loading" && <div>Creating import preview...</div>}
      {previewStatus === "done" && pendingUploadData !== undefined && (
        <div>
          {previewError && `Error creating preview: ${previewError}`}
          {!previewError &&
            `${pendingUploadData.pendingUploads.length} pending uploads. Initial checks found ${issueCount} issue(s).`}
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
        {!pendingUploadData ? (
          <></>
        ) : (
          pendingUploadData.pendingUploads.map((item) => (
            <PendingOrderUploadDisplay
              key={item.id}
              pendingUpload={item}
              ok={
                pendingUploadData.validationStatuses.find(
                  (status) => status.id === item.id,
                )?.overallStatus === "ok"
              }
            />
          ))
        )}
      </div>
      <div>
        <button type="submit">
          {previewStatus === "idle"
            ? "Preview Import"
            : previewStatus === "loading"
              ? "Please wait..."
              : "Upload"}
        </button>
      </div>
    </form>
  );
}
