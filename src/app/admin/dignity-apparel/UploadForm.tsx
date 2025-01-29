"use client";

import { uploadSyncData } from "@/actions/dignity-apparel/dignity-apparel";
import { FormEvent, useState } from "react";

export function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await uploadSyncData(formData);
      setLoading(false);
      setSuccess(true);
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
        {!loading && !error && <button type="submit">Upload</button>}
        {loading && "Uploading data..."}
        {success &&
          "Upload complete. Sync will take place during the next designated time period."}
        {error && `Upload error: ${error}`}
      </div>
    </form>
  );
}
