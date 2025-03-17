"use client";

import { uploadSyncData } from "@/actions/products/products";
import { useToast } from "@/components/ToastProvider";
import { FormEvent, useState } from "react";

export function UploadForm() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    try {
      await uploadSyncData(formData);
      toast.toast("Test message");
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
        {!loading && <button type="submit">Upload</button>}
        {loading && "Uploading data..."}
      </div>
    </form>
  );
}
