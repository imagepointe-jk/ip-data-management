"use client";

import { FormEvent, useState } from "react";
import { PendingOrderUploadDisplay } from "./PendingOrderUploadDisplay";
import {
  createPendingOrderUploadData,
  PendingOrderUploadData,
  UploadResult,
} from "./orderImport";
import { createOrder } from "@/fetch/client/woocommerce";

export function OrderImportForm() {
  const [pendingUploadData, setPendingUploadData] =
    useState<PendingOrderUploadData>();
  const [previewStatus, setPreviewStatus] = useState<
    "idle" | "loading" | "done"
  >("idle");
  const [previewError, setPreviewError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "done">(
    "idle",
  );
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
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
      console.log(error);
      const message = error instanceof Error ? error.message : "Unknown error.";
      setPreviewError(message);
    }

    setPreviewStatus("done");
  }

  async function uploadData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingUploadData) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const url = `${formData.get("url")}`;
    const key = `${formData.get("key")}`;
    const secret = `${formData.get("secret")}`;

    setUploadStatus("loading");
    for (const item of pendingUploadData.pendingUploads) {
      try {
        const response = await createOrder(url, key, secret, item);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(
            `Status code ${response.status}. Message from the server: ${json.message || "(no message found)"}`,
          );
        }
        setUploadResults((prev) => [
          ...prev,
          { payload: item, message: "Upload successful.", ok: true },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error.";
        setUploadResults((prev) => [
          ...prev,
          { payload: item, message, ok: false },
        ]);
      }
    }
    setUploadStatus("done");
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
      {previewStatus === "done" && uploadStatus === "idle" && (
        <div>
          {previewError && `Error creating preview: ${previewError}`}
          {!previewError &&
            pendingUploadData !== undefined &&
            `${pendingUploadData.pendingUploads.length} pending uploads. Initial checks found ${issueCount} order(s) with issue(s).`}
        </div>
      )}
      {uploadStatus === "loading" && (
        <div>
          Processing order {uploadResults.length + 1} of{" "}
          {pendingUploadData?.pendingUploads.length}...
        </div>
      )}
      {uploadStatus === "done" && (
        <div>
          Upload complete. {uploadResults.filter((result) => !result.ok).length}{" "}
          issue(s).
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
        {pendingUploadData && uploadStatus === "idle" && (
          <>
            {pendingUploadData.pendingUploads.map((item) => (
              <PendingOrderUploadDisplay
                key={item.id}
                pendingUpload={item}
                validationStatus={pendingUploadData.validationStatuses.find(
                  (status) => status.id === item.id,
                )}
              />
            ))}
          </>
        )}
        {(uploadStatus === "loading" || uploadStatus === "done") && (
          <>
            {uploadResults.map((result) => (
              <div key={result.payload.id} style={{ fontFamily: "monospace" }}>
                {`Result for order ${result.payload.id}: ${result.message}`}
              </div>
            ))}
          </>
        )}
      </div>
      {uploadStatus !== "done" && (
        <div>
          <button type="submit">
            {previewStatus === "idle"
              ? "Preview Import"
              : previewStatus === "loading"
                ? "Please wait..."
                : "Upload"}
          </button>
        </div>
      )}
    </form>
  );
}
