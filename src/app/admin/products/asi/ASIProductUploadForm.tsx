"use client";

import { startSync } from "@/actions/products/products";
import { useToast } from "@/components/ToastProvider";
import { FormEvent, useState } from "react";

export function ASIProductUploadForm() {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const toast = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    try {
      await startSync(formData);
      toast.toast("Upload successful", "success");
      setComplete(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
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
        {!loading && !complete && <button type="submit">Upload</button>}
        {loading && "Uploading data..."}
        {complete && "Sync process started."}
      </div>
    </form>
  );
}
