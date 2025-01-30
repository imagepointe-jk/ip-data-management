"use client";

import { uploadSyncData } from "@/actions/dignity-apparel/dignity-apparel";
import { FormEvent, useState } from "react";

export function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [success, setSuccess] = useState(false);
  const [errorIndices, setErrorIndices] = useState([] as number[]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const result = await uploadSyncData(formData);
      setLoading(false);
      setSuccess(true);
      setErrorIndices(result.errorIndices);
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
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
      <label htmlFor="file">
        <input type="file" name="file" id="file" />
      </label>
      <div>
        {!loading && !error && !success && (
          <button type="submit">Upload</button>
        )}
        {loading && "Uploading data..."}
        {success &&
          "Upload complete. Sync will take place during the next designated time period."}
        {error && `Upload error: ${error}`}
        {errorIndices.length > 0 && (
          <div style={{ fontWeight: "bold" }}>
            Invalid data found at the following row(s). Fixing these errors is
            recommended, as they could cause incorrect data to be synced.{" "}
            {`[${errorIndices.map((n) => n + 2).join(", ")}]`}{" "}
          </div>
        )}
      </div>
    </form>
  );
}
